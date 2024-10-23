import { ethers } from "ethers";
import "dotenv/config";
import fs from "fs";


// Load environment variables for the RPC endpoints and private keys
const { BSC_RPC_URL, POLYGON_RPC_URL, SIGNER_PRIVATE_KEY, POLYGON_TOKEN_ADDRESS, BSC_TOKEN_ADDRESS } = process.env;
if (!BSC_RPC_URL || !POLYGON_RPC_URL || !SIGNER_PRIVATE_KEY) {
  throw new Error("Please set BSC_RPC_URL, POLYGON_RPC_URL, and SIGNER_PRIVATE_KEY in the .env file");
}

// Connect to both BNB and Polygon networks
const bnbProvider = new ethers.JsonRpcProvider(BSC_RPC_URL);
const signerBnb = new ethers.Wallet(SIGNER_PRIVATE_KEY, bnbProvider);

const polygonProvider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
const signerPolygon = new ethers.Wallet(SIGNER_PRIVATE_KEY, polygonProvider);

// The ABI for the Bridge contract
const bridgeABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mintTokenToUserAfterBridge",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "chainId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "DepositFromUser",
    "type": "event"
  },
];

// Load environment variables for the RPC endpoints and private keys
const { BSC_BRIDGE_ADDRESS, POLYGON_BRIDGE_ADDRESS } = process.env;
if (!BSC_BRIDGE_ADDRESS || !POLYGON_BRIDGE_ADDRESS ) {
  throw new Error("Please set BSC_BRIDGE_ADDRESS, POLYGON_BRIDGE_ADDRESS in the .env file");
}

// Addresses of the bridge contracts on both networks
const bnbBridgeAddress = BSC_BRIDGE_ADDRESS;
const polygonBridgeAddress = POLYGON_BRIDGE_ADDRESS;

// Create contract instances
const bnbBridgeContract = new ethers.Contract(bnbBridgeAddress, bridgeABI, signerBnb);
const polygonBridgeContract = new ethers.Contract(polygonBridgeAddress, bridgeABI, signerPolygon);

// Load processed events from a JSON file to track what has been processed
const processedEventsFile = "processedEvents.json";
let processedEvents = new Set();
if (fs.existsSync(processedEventsFile)) {
  const data = fs.readFileSync(processedEventsFile, "utf8");
  processedEvents = new Set(JSON.parse(data));
}

// Save processed events to prevent double processing
const saveProcessedEvent = (eventId: string) => {
  processedEvents.add(eventId);
  fs.writeFileSync(processedEventsFile, JSON.stringify([...processedEvents]));
};

// Function to process events in a loop
async function processEvents() {
  console.log("Starting event processing loop...");

  while (true) {
    try {
      // Get past events from BNB Bridge
      const bnbEvents = await bnbBridgeContract.queryFilter(bnbBridgeContract.filters.DepositFromUser(), -10000);
      for (const event of bnbEvents as any) {
        const eventId = `${event.transactionHash}_${event.log?.logIndex ?? event.index}`;
        if (processedEvents.has(eventId)) {
          continue;
        }

        const args = event.args as any;
        console.log(`Deposit detected on BNB Testnet: 
          From: ${args.from}, 
          Recipient: ${args.recipient}, 
          Token: ${args.token}, 
          ChainId: ${args.chainId}, 
          Amount: ${ethers.formatEther(args.amount)} ETH`);
  
        if (args.chainId == 80002) { // Assuming 80002 is the Polygon Testnet Chain ID
          const tx = await polygonBridgeContract.mintTokenToUserAfterBridge(args.recipient, POLYGON_TOKEN_ADDRESS, args.amount);
          const receipt = await tx.wait();
          console.log(`Minted ${ethers.formatEther(args.amount)} tokens to ${args.recipient} on Polygon Amoy Testnet. Transaction Hash: ${receipt.hash}`);
          saveProcessedEvent(eventId);
        }
      }

      // Get past events from Polygon Bridge
      const polygonEvents = await polygonBridgeContract.queryFilter(polygonBridgeContract.filters.DepositFromUser(), -10000);
      for (const event of polygonEvents as any) {
        const eventId = `${event.transactionHash}_${event.log?.logIndex ?? event.index}`;
        if (processedEvents.has(eventId)) {
          continue;
        }

        const args = event.args as any;
        console.log(`Deposit detected on Polygon Amoy Testnet: 
          From: ${args.from}, 
          Recipient: ${args.recipient}, 
          Token: ${args.token}, 
          ChainId: ${args.chainId}, 
          Amount: ${ethers.formatEther(args.amount)} ETH`);
        
        if (args.chainId == 97) { // Assuming 97 is the BNB Testnet Chain ID
          const tx = await bnbBridgeContract.mintTokenToUserAfterBridge(args.recipient, BSC_TOKEN_ADDRESS, args.amount);
          const receipt = await tx.wait();
          console.log(`Minted ${ethers.formatEther(args.amount)} tokens to ${args.recipient} on BNB Testnet. Transaction Hash: ${receipt.hash}`);
          saveProcessedEvent(eventId);
        }
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds delay
    } catch (error) {
      console.error("Error in event processing loop: ", error);
    }
  }
}

processEvents().catch((error) => {
  console.error("Fatal error in event processing loop: ", error);
  process.exit(1);
});
