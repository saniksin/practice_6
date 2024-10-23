import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";


function checkRequirements() {
    const { OWNER_PRIVATE_KEY, SIGNER_PRIVATE_KEY, BNBSCAN_API_KEY, POLYGONSCAN_API_KEY } = process.env;
    if (!OWNER_PRIVATE_KEY) {
      throw new Error("Please set your OWNER_PRIVATE_KEY in the .env file");
    } 
    if (!SIGNER_PRIVATE_KEY) {
      throw new Error("Please set your SIGNER_PRIVATE_KEY in the .env file");
    }
    if (!BNBSCAN_API_KEY) {
      throw new Error("Please set your ETHERSCAN_API_KEY in the .env file");
    }
    if (!POLYGONSCAN_API_KEY) {
      throw new Error("Please set your ETHERSCAN_API_KEY in the .env file");
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


export { checkRequirements, checkBalance }