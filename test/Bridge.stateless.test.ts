import { loadFixture, ethers } from "./setup";
import { expect } from "chai";
import { Log, EventLog, ContractTransactionReceipt } from "ethers";

describe("SaniksinBridge - тесты моста и токена (stateless)", function () {
    // Номер сети hardhat
    const HardhatChainId: number = 1337;
    // Минимальное кол-во токенов доступно для бриджа
    const BridgeMinAmount: bigint = ethers.parseEther("1");
    // сумма которую юзер будет использовать
    const AmountToUse: bigint = ethers.parseEther("5")

    async function deployBridgeFixture() {
        const [owner, user, signer] = await ethers.getSigners();

        // Развёртывание контракта SaniksinBridge
        const BridgeFactory = await ethers.getContractFactory("SaniksinBridge");
        const bridge = await BridgeFactory.deploy();
        await bridge.waitForDeployment();

        // Развёртывание контракта MyERC20Token
        const ERC20TokenFactory = await ethers.getContractFactory("MyERC20Token");
        const token = await ERC20TokenFactory.deploy();
        await token.waitForDeployment();

        // Настройка разрешений моста
        await bridge.connect(owner).setSigner(signer.address, true); 
        await bridge.connect(owner).setAllowedToken(token.target, true, BridgeMinAmount); 
        await bridge.connect(owner).setAllowedChain(HardhatChainId, true); 

        // Настройка токена
        await token.connect(owner).setUpBridge(bridge.target)

        return { bridge, token, owner, user, signer };
    }

    it("Отказ, если не-авторизованный пользователь пытается минтить токены в контракте токена", async function () {
        const { token, user } = await loadFixture(deployBridgeFixture);
        await expect(token.connect(user).mint(user.address, AmountToUse)).to.be.revertedWithCustomError(
            token,
            "Token__OnlyAuthorizedCallers()"
        );
    });

    it("Отказ, если не-авторизованный пользователь cжечь токены в контракте токена", async function () {
        const { token, user } = await loadFixture(deployBridgeFixture);
        await expect(token.connect(user).burn(user.address, AmountToUse)).to.be.revertedWithCustomError(
            token,
            "Token__OnlyAuthorizedCallers()"
        );
    });

    it("Отказ, если не-авторизованный пользователь пытается cамостоятельно минтить токены", async function () {
        const { bridge, token, user } = await loadFixture(deployBridgeFixture);
        // Попытка минтить токены после моста не авторизованным пользователем
        await expect(bridge.connect(user).mintTokenToUserAfterBridge(
            user.address, 
            token.target,
            AmountToUse
        )).to.be.revertedWithCustomError(
            bridge,
            "Bridge__OnlyAuthorizedSigners()"
        );
    });

    it("Отказ, если не-авторизованный пользователь пытается добавить signer`a", async function () {
        const { bridge, user } = await loadFixture(deployBridgeFixture);
        // Попытка установить подписанта не владельцем
        await expect(bridge.connect(user).setSigner(user.address, true)).to.be.reverted;
    });

    it("Отказ, если не-авторизованный пользователь пытается добавить токен", async function () {
        const { bridge, token, user } = await loadFixture(deployBridgeFixture);
        // Попытка разрешить токен не владельцем
        await expect(bridge.connect(user).setAllowedToken(token.target, true, ethers.parseEther("1"))).to.be.reverted;
    });

    it("Отказ, если не-авторизованный пользователь пытается добавить ChainID", async function () {
        const { bridge, user } = await loadFixture(deployBridgeFixture);
        // Попытка разрешить ChainID не владельцем
        await expect(bridge.connect(user).setAllowedChain(1, true)).to.be.reverted;
    });

    it("Отказ, если пользователь пытается бриджить кол-во токенов ниже минимального", async function () {
        const { bridge, token, user } = await loadFixture(deployBridgeFixture);
        await token.mint(user, AmountToUse)

        const badAmountToBridge = ethers.parseEther("0.5");
        
        await expect(
            bridge.connect(user).bridgeTokens(
                user.address, 
                user.address, 
                token.target, 
                HardhatChainId, 
                badAmountToBridge
        )
        ).to.be.revertedWithCustomError(
            bridge,
            "Bridge__AmountBelowMinimum()"
        );
    });

    it("Отказ, если пользователь передает не разрешенный сhainId", async function () {
        const { bridge, token, user } = await loadFixture(deployBridgeFixture);

        await token.mint(user, AmountToUse)

        const BadChainId = 1;
        
        await expect(
            bridge.connect(user).bridgeTokens(
                user.address, 
                user.address, 
                token.target, 
                BadChainId, 
                AmountToUse
        )
        ).to.be.revertedWithCustomError(
            bridge,
            "Bridge__ChainIdNotAllowed()"
        );
    });

    it("Отказ, если пользователь передает не разрешенный адрес токена", async function () {
        const { bridge, token, user } = await loadFixture(deployBridgeFixture);

        await token.mint(user, AmountToUse)

        const BadChainId = 1;
        
        await expect(
            bridge.connect(user).bridgeTokens(
                user.address, 
                user.address, 
                bridge.target, 
                BadChainId, 
                AmountToUse
        )
        ).to.be.revertedWithCustomError(
            bridge,
            "Bridge__TokenNotAllowed()"
        );
    });
});
