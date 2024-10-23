import { ethers } from "./setup";
import { expect } from "chai";
import { MyERC20Token, SaniksinBridge} from "../typechain-types";
import { ContractTransactionReceipt } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";


describe("SaniksinBridge - тесты моста и токена (stateful)", function () {
    // Номер сети hardhat
    const HardhatChaindId: number = 1337;
    // Минимальное кол-во токенов доступно для бриджа
    const BridgeMinAmount: bigint = ethers.parseEther("1");
    // Сумма токенов которые минтим юзеру для тестов от владельца токена
    const mintToUserTokenAmount: bigint = ethers.parseEther("10");
    // сумма которую юзер будет бриджить
    const AmountToBridge: bigint = ethers.parseEther("5")
    // контракт токена
    let token: MyERC20Token;
    // контракт моста
    let bridge: SaniksinBridge;

    // пользователи 
    let owner: SignerWithAddress;
    let signer: SignerWithAddress;
    let user: SignerWithAddress;

    // подготавливаем состояние блокчейна перед тестами
    before(async function () {
        [owner, user, signer] = await ethers.getSigners();

        // Развёртывание контракта SaniksinBridge
        const BridgeFactory = await ethers.getContractFactory("SaniksinBridge");
        bridge = await BridgeFactory.deploy();
        await bridge.waitForDeployment();

        // Развёртывание контракта MyERC20Token
        const ERC20TokenFactory = await ethers.getContractFactory("MyERC20Token");
        token = await ERC20TokenFactory.deploy();
        await token.waitForDeployment();

        // Настройка разрешений моста
        await bridge.connect(owner).setSigner(signer.address, true);
        await bridge.connect(owner).setAllowedToken(token.target, true, BridgeMinAmount); 
        await bridge.connect(owner).setAllowedChain(HardhatChaindId, true);

        // Настройка токена
        await token.connect(owner).setUpBridge(bridge.target)

        return { bridge, token, owner, user, signer };
    });

    // Блок 1. Можна депозитить токены в мост и создавать события.
    describe(" Блок 1. Можна депозитить токены в мост и создавать события.", async function () {
        let receipt: null | ContractTransactionReceipt;
        
        it(" Минтим токены на адерес user", async function () {
            await token.mint(user.address, mintToUserTokenAmount);
            expect(await token.balanceOf(user.address)).to.equal(mintToUserTokenAmount);
        });

        it(" Даем апрув мосту на использование токенов юзера", async function () {
            // Approving bridge to transfer user's tokens
            await token.connect(user).approve(bridge.target, AmountToBridge);
            expect(await token.connect(user).allowance(user.address, bridge.target)).to.eq(AmountToBridge);
        });

        it(" Депозитим токены на адрес контракта моста и сжигаем токены", async function () {
            const tx = await bridge.connect(user).bridgeTokens(
                user.address, 
                user.address, 
                token.target, 
                HardhatChaindId, 
                AmountToBridge
            );
            receipt = await tx.wait();
            await expect(tx).to.changeTokenBalance(
                token, 
                user,
                -AmountToBridge
            );    

            expect(await token.balanceOf(bridge.target)).to.eq(0);
        });

        it(" Событие депозита токенов успешно создалось", async function () {
            await expect(receipt).to.emit(bridge, "DepositFromUser").withArgs(
                user.address,
                user.address,
                token.target,
                HardhatChaindId,
                AmountToBridge
            );
        });
    });

    // Блок 2. Можна минтить токены в сети назначения после бриджа.
    describe("Блок 2. Можна минтить токены в сети назначения после бриджа.", async function () {
        let receipt: null | ContractTransactionReceipt;

        it(" Минтим токены в сети назначения после перевода signer`ом", async function () {
            // Изначально минтили 10 токенов, слали 5 на мост и сожгли, теперь минтим 5 токенов назад. 
            expect(await token.balanceOf(user.address)).to.equal(AmountToBridge)
            const tx = await bridge.connect(signer).mintTokenToUserAfterBridge(user.address, token.target, AmountToBridge);
            receipt = await tx.wait();
            expect(await token.balanceOf(user.address)).to.equal(mintToUserTokenAmount);
        });
        
        it(" Событие минта токенов успешно создалось", async function () {
            await expect(receipt).to.emit(bridge, "SignerMintToUser").withArgs(
                signer.address,
                user.address,
                token.target,
                AmountToBridge,
            );
        });
    });
});
