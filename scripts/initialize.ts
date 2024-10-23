import { ethers, network } from "hardhat";
import "dotenv/config";
import { checkRequirements, checkBalance, estimateGasWithMultiplier } from "./checkRequirements";
import { SaniksinBridge__factory, MyERC20Token__factory } from "../typechain-types";

async function main() {
    // проверяем зависимости
    console.log(`Initialize contracts to network: ${network.name}`);
    checkRequirements();

    // подтягиваем owner, signer
    const [owner, signer] = await ethers.getSigners();  
  
    // парсим балансы
    const minDeployBalance = ethers.parseEther("0.001");
    const { ownerBalance } = await checkBalance(owner, signer);
    
    if (ownerBalance < minDeployBalance) {
        throw new Error(`ownerBalance or signerBalance must be more ${ethers.formatEther(minDeployBalance)}
            ownerBalance: ${ethers.formatEther(ownerBalance)}
        `);
    }
    
    // инициализируем контракты
    let bridgeAddress: string;
    let tokenAddress: string;
    let AllowedChaindId: number;

    if (network.name === "BNBtestnet") {
        bridgeAddress = process.env.BNB_BRIDGE_ADDRESS!;
        tokenAddress = process.env.BNB_TOKEN_ADDRESS!;
        AllowedChaindId = 80002;
    } else if (network.name === "polygonAmoyTestnet") {
        bridgeAddress = process.env.ZK_BRIDGE_ADDRESS!;
        tokenAddress = process.env.ZK_TOKEN_ADDRESS!;
        AllowedChaindId = 97;
    }

    console.log(`Адрес моста: ${bridgeAddress!}`)
    console.log(`Адрес токена: ${tokenAddress!}`)

    const bridge = SaniksinBridge__factory.connect(bridgeAddress!, owner);
    const token = MyERC20Token__factory.connect(tokenAddress!, owner);
    
    const BridgeMinAmount = ethers.parseEther("1");
    const gasPrice = (BigInt(await ethers.provider.send("eth_gasPrice", [])) * BigInt(Math.round(1.2 * 100))) / BigInt(100);

    console.log('Начинаю инициализировать bridge...');
    console.log('1/3 tx...');
    const firstTx = await bridge.setSigner(signer.address, true, {
        gasLimit: await estimateGasWithMultiplier(
            bridge.target,
            owner.address,
            bridge.interface.encodeFunctionData("setSigner", [signer.address, true])
        ),
        gasPrice: gasPrice,
    });
    await firstTx.wait();
    console.log(`1/3 tx done. Hash - ${firstTx.hash}`);

    console.log('2/3 tx...');
    const secondTx = await bridge.setAllowedToken(token.target, true, BridgeMinAmount, {
        gasLimit: await estimateGasWithMultiplier(
            bridge.target,
            owner.address,
            bridge.interface.encodeFunctionData("setAllowedToken", [token.target, true, BridgeMinAmount])
        ), 
        gasPrice: gasPrice
    });
    await secondTx.wait();
    console.log(`2/3 tx done. Hash - ${secondTx.hash}`);
    
    console.log('3/3 tx...');
    const thirdTx = await bridge.setAllowedChain(AllowedChaindId!, true, {
        gasLimit: await estimateGasWithMultiplier(
            bridge.target,
            owner.address,
            bridge.interface.encodeFunctionData("setAllowedChain", [AllowedChaindId!, true])
        ),
        gasPrice: gasPrice
    });
    await thirdTx.wait();
    console.log(`3/3 tx done. Hash - ${thirdTx.hash}`);

    console.log('Начинаю инициализировать token...');
    console.log('1/1 tx...');
    const fourthTx = await token.setUpBridge(bridge.target, {
        gasLimit: await estimateGasWithMultiplier(
            token.target,
            owner.address,
            token.interface.encodeFunctionData("setUpBridge", [bridge.target])
        ), 
        gasPrice: gasPrice
    });
    await fourthTx.wait();
    console.log(`1/1 tx done. Hash - ${fourthTx.hash}`);

    console.log(
        `Инициализация в ${network.name} прошла успешно: 
        Токен: ${token.target}
        Мост: ${bridge.target}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
