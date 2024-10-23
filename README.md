# opBNB and Polygon zkEVM Deployment Example

This project demonstrates how to deploy and verify smart contracts on opBNB Testnet and Polygon zkEVM Testnet. The project is created for educational purposes as part of practice for OTUS.

## Project Overview

The provided Hardhat configuration allows deployment and interaction with two networks:

- **opBNB Testnet**: Deployed using the opBNB RPC endpoint.
- **Polygon zkEVM Testnet**: Deployed using the Polygon zkEVM Testnet RPC endpoint.

## Step-by-Step Guide

### 1. Install Dependencies

Install necessary dependencies using npm:

```bash
npm install
```

### 2. Understand the Contracts

Begin by reading through the contracts to understand their purpose and how their functions interact. This will help in understanding their intended behavior.

### 2. Run Tests

To ensure everything is working as expected, run the following command to execute the tests:

```bash
npx hardhat test
```

Running the tests will give you a better insight into the behavior of the smart contracts.

### 3. Set Up Environment Variables

To deploy the contracts on the Polygon and BNB networks, you need to set up environment variables:

- `COINMARKETCAP_KEY=` *(optional)*
- `BNB_RPC_URL=https://bsc-testnet-rpc.publicnode.com` *(required)*
- `POLYGON_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com` *(required)*
- `OWNER_PRIVATE_KEY=` *(required)*
- `SIGNER_PRIVATE_KEY=` *(required)*
- `BNBSCAN_API_KEY=` *(required)*
- `POLYGONSCAN_API_KEY=` *(required)*

These variables are essential to interact with the blockchain, verify contracts, and for API access.

### 4. Deploy Contracts

To deploy the bridge and token contracts on different networks, use the following commands by running them with npm:

```bash
npm run deploy-BNBtestnet-token
npm run deploy-BNBtestnet-bridge
npm run deploy-polygonAmoyTestnet-token
npm run deploy-polygonAmoyTestnet-bridge
```

These commands will deploy the token and bridge contracts to their respective networks.

### 5. Verification Issues

If you encounter verification errors, retry with the following commands:

- For Polygon:
  ```bash
  npx hardhat ignition verify chain-80002 --include-unrelated-contracts
  ```
- For Binance Smart Chain:
  ```bash
  npx hardhat ignition verify chain-97 --include-unrelated-contracts
  ```

### 6. Initialize Contracts

After deployment, you need to initialize the contracts' states. Set the following environment variables:

- `ZK_BRIDGE_ADDRESS=` *(required)* Polygon bridge address
- `BNB_BRIDGE_ADDRESS=` *(required)* BNB bridge address
- `ZK_TOKEN_ADDRESS=` *(required)* Polygon token address
- `BNB_TOKEN_ADDRESS=` *(required)* BNB token address

These variables are necessary to properly configure the bridge and token contracts for interaction.

## Key Features

- **Educational Focus**: This project is designed to help you understand smart contracts and blockchain deployments through practice.
- **Multiple Network Deployment**: Deploys to both the Polygon zkEVM Testnet and BNB Testnet.
- **Verification and Troubleshooting**: Easy commands for verifying contracts and addressing verification issues.

Feel free to explore the contracts, run the tests, and try out the deployments to deepen your understanding of blockchain development.

- For Polygon:
  ```bash
  npx hardhat run scripts/initialize.ts --network BNBtestnet 
  ```
- For Binance Smart Chain:
  ```bash
  npx hardhat run scripts/initialize.ts --network polygonAmoyTestnet 
  ```

## 7. Running Cross-Chain Listening and Minting

- The script listens for deposits on one chain and automatically mints equivalent tokens on the other chain. Make sure that the signer wallet has enough funds to cover the transaction fees on both networks before running the script.

- To initiate the event listener and ensure the bridge is active, use the following command:

  ```bash
  npx hardhat run scripts/listen.ts
  ```

