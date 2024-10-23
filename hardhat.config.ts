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
    opBNBtestnet: {
      url: "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: [
        process.env.OWNER_PRIVATE_KEY || "",
        process.env.SIGNER_PRIVATE_KEY || ""
      ].filter((key): key is string => !!key),
    },
    polygonZkEVMTestnet: {
      url: "https://rpc.cardona.zkevm-rpc.com",
      chainId: 2442,
      accounts: [
        process.env.OWNER_PRIVATE_KEY || "",
        process.env.SIGNER_PRIVATE_KEY || ""
      ].filter((key): key is string => !!key),
    },
  },
  etherscan: {
    apiKey: {
      polygonZkEVMTestnet: process.env.POLYGONSCAN_API_KEY || "",
      opBNBtestnet: process.env.BNBSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "opBNBtestnet",
        chainId: 5611,
        urls: {
          apiURL: "https://api-opbnb-testnet.bscscan.com/api",
          browserURL: "https://opbnb-testnet.bscscan.com",
        },
      },
      {
        network: "polygonZkEVMTestnet",
        chainId: 2442,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://testnet.polygonscan.com",
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
