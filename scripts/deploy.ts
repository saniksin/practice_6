import { ethers, network, run } from "hardhat";
import "dotenv/config";
import { checkRequirements, checkBalance } from "./checkRequirements";


// Команды для запуска скрипта и верификации в двух сетях:
// npx hardhat run scripts/deploy.ts --network opBNBtestnet
// npx hardhat run scripts/deploy.ts --network polygonZkEVMTestnet


const networkSettings = {
    "opBNBtestnet": {
        "tokenName": "opBNB Saniksin USD",
        "tokenSymbol": "opUSD",
        "allowedChainId": 2442,
    },
    "polygonZkEVMTestnet": {
        "tokenName": "Polygon zkEVM Saniksin USD",
        "tokenSymbol": "zkUSD",
        "allowedChainId": 5611,
    },
}


async function main() {
    // проверяем зависимости
    console.log(`Deploying contracts to network: ${network.name}`);
    checkRequirements()

    const minDeployBalance = ethers.parseEther("0.001")
    const [owner, signer] = await ethers.getSigners();  
    // парсим балансы
    const { ownerBalance, signerBalance } = await checkBalance(owner, signer)
    
    if (ownerBalance < minDeployBalance) {
        throw new Error(`ownerBalance or signerBalance must be more ${ethers.formatEther(minDeployBalance)}
            ownerBalance: ${ethers.formatEther(ownerBalance)}
        `);
    }
    
    console.log(`Starting deploying contracts to network: ${network.name}`);
    
    let tokenName: string;
    let tokenSymbol: string;
    let AllowedChaindId: number;

    if (network.name == "opBNBtestnet") {
        tokenName = networkSettings.opBNBtestnet.tokenName;
        tokenSymbol = networkSettings.opBNBtestnet.tokenSymbol;
        AllowedChaindId = networkSettings.opBNBtestnet.allowedChainId;
      } else if (network.name == "polygonZkEVMTestnet") {
        tokenName = networkSettings.polygonZkEVMTestnet.tokenName;
        tokenSymbol = networkSettings.polygonZkEVMTestnet.tokenSymbol;
        AllowedChaindId = networkSettings.polygonZkEVMTestnet.allowedChainId;
      } else {
        throw new Error(`Unsupported network - ${network.name}`);
      }

    // Развёртывание контракта SaniksinBridge
    const BridgeFactory = await ethers.getContractFactory("SaniksinBridge");
    const bridge = await BridgeFactory.deploy();
    await bridge.waitForDeployment();
    console.log(`SaniksinBridge deployed to: ${bridge.target}`);

    // Развёртывание контракта MyERC20Token
    const ERC20TokenFactory = await ethers.getContractFactory("MyERC20Token");
    const token = await ERC20TokenFactory.deploy(owner.address, bridge.target, tokenName, tokenSymbol);
    await token.waitForDeployment();
    console.log(`MyERC20Token deployed to: ${token.target}`);

    // Настройка разрешений моста
    const BridgeMinAmount = ethers.parseEther("1"); // Минимальное количество токенов для бриджа

    await bridge.setSigner(signer.address, true);
    await bridge.setAllowedToken(token.target, true, BridgeMinAmount);
    await bridge.setAllowedChain(AllowedChaindId, true);

    console.log(
        `Bridge deploy completed for opBNB: \n 
        Токен: ${token.target}
        Мост: ${bridge.target}
        `
    );
    
    // Верификация контракта на Etherscan
    console.log(`Start contracts verification on ${network.name}.`);
    try {
        await run("verify:verify", {
            //address: '0xc508ae8e7CA7d8969dcD526a9C8542b441f384B4',//bridge.target,
            address: bridge.target,
            constructorArguments: [],
        });
        await run("verify:verify", {
            //address: '0x2bCb72D3F1a2BA0780beB507d6157634C3dBA198',//token.target,
            //constructorArguments: ['0xfa05e1d0d51423A894db3D410E1e12cbDF4217A8', '0xc508ae8e7CA7d8969dcD526a9C8542b441f384B4', tokenName, tokenSymbol],
            address: token.target,
            constructorArguments: [signer.address, bridge.target, tokenName, tokenSymbol],
        });
        console.log(`Verification completed on ${network.name}.`);
    } catch (error) {
        console.error("Verification failed: ", error);
    }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

