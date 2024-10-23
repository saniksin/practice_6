import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Addressable } from "ethers";


async function estimateGasWithMultiplier(
  to: string | Addressable, 
  from: string | Addressable, 
  data: string, 
  multiplier: number = 1.5
) {
    const estimatedGas = await ethers.provider.estimateGas({
        to,
        from,
        data
    });
    return estimatedGas * BigInt(Math.round(multiplier * 100)) / BigInt(100);
}


function checkRequirements() {
  const {
      OWNER_PRIVATE_KEY,
      SIGNER_PRIVATE_KEY,
      BNB_BRIDGE_ADDRESS,
      BNB_TOKEN_ADDRESS,
      ZK_BRIDGE_ADDRESS,
      ZK_TOKEN_ADDRESS
  } = process.env;

  if (network.name === "BNBtestnet") {
      if (
          !OWNER_PRIVATE_KEY ||
          !SIGNER_PRIVATE_KEY ||
          !BNB_BRIDGE_ADDRESS ||
          !BNB_TOKEN_ADDRESS
      ) {
          throw new Error(
              "Please set your OWNER_PRIVATE_KEY, SIGNER_PRIVATE_KEY, " +
              "BNB_BRIDGE_ADDRESS, and BNB_TOKEN_ADDRESS in the .env file"
          );
      }
  } else if (network.name === "polygonAmoyTestnet") {
      if (
          !OWNER_PRIVATE_KEY ||
          !SIGNER_PRIVATE_KEY ||
          !ZK_BRIDGE_ADDRESS ||
          !ZK_TOKEN_ADDRESS
      ) {
          throw new Error(
              "Please set your OWNER_PRIVATE_KEY, SIGNER_PRIVATE_KEY, " +
              "ZK_BRIDGE_ADDRESS, and ZK_TOKEN_ADDRESS in the .env file"
          );
      }
  } else {
      throw new Error(
          "Please use a correct network (BNBtestnet or polygonAmoyTestnet)"
      );
  }
}


async function checkBalance(
    addressOwner: SignerWithAddress, addressSigner: SignerWithAddress
  ): Promise<{ ownerBalance: bigint; signerBalance: bigint }> {

    console.log(`Owner address: ${addressOwner.address}`);
    console.log(`Signer address: ${addressSigner.address}`);

    const ownerBalance = await ethers.provider.getBalance(addressOwner.address);
    const signerBalance = await ethers.provider.getBalance(addressSigner.address);

    console.log(`Owner balance: ${ethers.formatEther(ownerBalance)}`);
    console.log(`Signer balance: ${ethers.formatEther(signerBalance)}`);

    return { ownerBalance, signerBalance }
}


export { checkRequirements, checkBalance, estimateGasWithMultiplier}