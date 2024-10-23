import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";


const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.27",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    BNBtestnet: {
      url: "https://bsc-testnet-rpc.publicnode.com",
      chainId: 97,
      accounts: [
        process.env.OWNER_PRIVATE_KEY || "",
        process.env.SIGNER_PRIVATE_KEY || ""
      ].filter((key): key is string => !!key),
      gasPrice: "auto"
    },
    polygonAmoyTestnet: {
      url: "https://polygon-amoy-bor-rpc.publicnode.com",
      chainId: 80002,
      accounts: [
        process.env.OWNER_PRIVATE_KEY || "",
        process.env.SIGNER_PRIVATE_KEY || ""
      ].filter((key): key is string => !!key),
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      BNBtestnet: process.env.BNBSCAN_API_KEY || "",
      polygonAmoyTestnet: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "BNBtestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
      {
        network: "polygonAmoyTestnet",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: false,
    coinmarketcap: process.env.COINMARKETCAP_KEY,
    currency: 'USD',
    token: 'ETH'
  },
};

export default config;
