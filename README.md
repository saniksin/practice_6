# opBNB and Polygon zkEVM Deployment Example

This project demonstrates how to deploy and verify smart contracts on opBNB Testnet and Polygon zkEVM Testnet. The project is created for educational purposes as part of practice for OTUS.

## Project Overview

The provided Hardhat configuration allows deployment and interaction with two networks:
- **opBNB Testnet**: Deployed using the opBNB RPC endpoint.
- **Polygon zkEVM Testnet**: Deployed using the Polygon zkEVM Testnet RPC endpoint.

## To Set Up the Project:

1. **Install Dependencies**:

   Install necessary dependencies using npm:

   ```bash
   npm install
   ```

2. **Create Environment Variables File (.env)**:

   Create a `.env` file in the root directory and add the following environment variables:

   ```
   OWNER_PRIVATE_KEY=<your_owner_private_key>
   SIGNER_PRIVATE_KEY=<your_signer_private_key>
   POLYGONSCAN_API_KEY=<your_polygonscan_api_key>
   BSCSCAN_API_KEY=<your_bscscan_api_key>
   COINMARKETCAP_KEY=<your_coinmarketcap_api_key>
   ```

3. **Deploy the Contracts**:

   Deploy the contracts to the desired network. Make sure to specify the correct network when running the script:

   ```bash
   npx hardhat run scripts/deploy.ts --network opBNBtestnet
   npx hardhat run scripts/deploy.ts --network polygonZkEVMTestnet
   ```

4. **Verify the Contracts**:

   After deploying, the contracts can be verified on the respective blockchain explorers (BscScan or PolygonScan). Verification is handled automatically in the deployment script if the required API keys are provided.

## Key Features

- **opBNB and Polygon zkEVM Deployment**: The Hardhat config supports deploying contracts to opBNB and Polygon zkEVM testnets.
- **Etherscan Verification**: Verification on the corresponding network explorer using the provided API keys.
- **Optimized Solidity Version**: The project uses Solidity `0.8.27` with optimization enabled for efficient bytecode.

## Hardhat Configuration Highlights

- **Networks Configuration**:
  - **opBNB Testnet**: RPC URL and Chain ID for opBNB are set.
  - **Polygon zkEVM Testnet**: RPC URL and Chain ID for Polygon zkEVM are configured.

- **Etherscan API Configuration**: Custom configuration for contract verification on both networks using `BSCSCAN_API_KEY` and `POLYGONSCAN_API_KEY`.

- **Gas Reporting**: Gas reporting is disabled by default. It can be enabled by setting `enabled: true` under the `gasReporter` section.

## To Run Tests:

1. **Compile the Contracts**:

   Compile the contracts to ensure everything is up to date:

   ```bash
   npx hardhat compile
   ```

2. **Run the Tests**:

   Execute the tests using Hardhat:

   ```bash
   npx hardhat test
   ```

   ### Types of Tests

   - **Stateless Tests**: These tests focus on verifying individual functions in isolation without relying on a specific state. This is useful for ensuring that basic contract behavior (such as input validation or individual function correctness) works as expected without depending on previous interactions.
     
   - **Stateful Tests**: These tests validate the full lifecycle of contract interactions, such as creating liquidity pools, performing swaps, or bridging tokens end-to-end. Stateful tests are particularly useful for scenarios that require maintaining consistency across multiple transactions or validating complex workflows.

## Troubleshooting

- **Invalid API Key Error**: Make sure your `.env` file contains valid API keys for BscScan and PolygonScan.
- **Verification Failure**: If verification fails, ensure the contract is deployed correctly and wait for a few minutes before retrying verification.

## Additional Notes

- **Environment Variables**: Ensure that `.env` variables are correctly set up before running any script to avoid deployment issues.
- **Supported Networks**: The project is configured for opBNB and Polygon zkEVM testnets, but additional networks can be added if needed.

Feel free to modify the configuration and use this as a starting point for your projects involving multiple blockchain deployments.

