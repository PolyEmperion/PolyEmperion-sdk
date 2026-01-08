/**
 * Relayer Example - How to use gasless transactions with POLYNOCTON SDK
 * 
 * This example shows how to:
 * 1. Initialize the SDK with relayer configuration
 * 2. Execute gasless (meta) transactions
 * 3. Wait for transaction confirmation
 * 4. Check transaction status
 * 
 * IMPORTANT FOR NEWBIES:
 * - Relayer is for ADVANCED use cases (gasless transactions)
 * - Most bots DON'T need this - use regular trading instead
 * - Use relayer when: Building web apps where you pay gas for users
 * - Don't use relayer when: Building personal bots or simple traders
 * 
 * WHAT IS A RELAYER?
 * - A service that executes transactions and pays gas fees for you
 * - Enables "gasless" trading where users don't pay gas
 * - Useful for better UX in production web applications
 * 
 * SET YOUR PRIVATE KEY:
 * export PRIVATE_KEY='0x...'
 * npm run examples:relayer
 */

import { POLYNOCTONSDK } from "../src/client.js";

async function main() {
  // Get your private key from environment variable
  // NEVER hardcode your private key in your code!
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("ERROR: Please set your PRIVATE_KEY environment variable");
    console.log("\nExample:");
    console.log("  export PRIVATE_KEY='0x...'");
    console.log("  npm run examples:relayer");
    process.exit(1);
  }

  console.log("=== POLYNOCTON SDK Relayer Example ===\n");
  console.log("⚠️  WARNING: Relayer is for ADVANCED use cases");
  console.log("    Most users should use regular trading instead.\n");

  // Initialize SDK with relayer configuration
  const sdk = new POLYNOCTONSDK({
    debug: true,
    relayer: {
      chainId: 137, // Polygon mainnet
      backend: {
        privateKey: privateKey,
      },
      // Optional: Add authentication if using a private relayer
      // auth: {
      //   authUrl: process.env.AUTH_URL,
      //   authToken: process.env.AUTH_TOKEN,
      // },
    },
  });

  // Initialize relayer client
  console.log("Initializing relayer client...");
  const relayer = sdk.relayer.init();
  console.log("Relayer client initialized!");
  console.log("Wallet address:", relayer.getWalletAddress());
  console.log("");

  // Example 1: Get relayer address
  console.log("=== Getting Relayer Address ===");
  try {
    const relayerAddress = await relayer.getRelayerAddress();
    console.log("Relayer address:", relayerAddress);
    console.log("This is the address that will execute transactions for you.\n");
  } catch (error: any) {
    console.error("Error getting relayer address:", error.message);
  }

  // Example 2: Get current nonce
  console.log("=== Getting Current Nonce ===");
  try {
    const nonce = await relayer.getNonce();
    console.log("Current nonce:", nonce);
    console.log("Nonces prevent transaction replay attacks.\n");
  } catch (error: any) {
    console.error("Error getting nonce:", error.message);
  }

  // Example 3: Get all transactions
  console.log("=== Getting Your Transactions ===");
  try {
    const transactions = await relayer.getTransactions();
    console.log(`You have ${transactions.length} relayer transaction(s)`);
    
    if (transactions.length > 0) {
      console.log("\nRecent transactions:");
      transactions.slice(0, 3).forEach((tx: any, i: number) => {
        console.log(`\n  Transaction ${i + 1}:`);
        console.log(`    ID: ${tx.transactionID}`);
        console.log(`    State: ${tx.state}`);
        console.log(`    Hash: ${tx.transactionHash || 'pending'}`);
        console.log(`    Created: ${tx.createdAt}`);
      });
    }
  } catch (error: any) {
    console.error("Error getting transactions:", error.message);
  }
  console.log("");

  // Example 4: Execute a gasless transaction (COMMENTED OUT - uncomment to test)
  /*
  console.log("=== Executing Gasless Transaction ===");
  try {
    // IMPORTANT: Replace these values with real contract call data!
    const contractAddress = "0x..."; // Contract to call
    const callData = "0x...";        // Encoded function call
    
    console.log(`Submitting gasless transaction to ${contractAddress}...`);
    
    const response = await relayer.executeProxyTransactions([
      {
        to: contractAddress,
        typeCode: "1",  // 1 = Call (most common)
        data: callData,
        value: "0"      // Usually "0" for token operations
      }
    ], "my-metadata"); // Optional metadata for tracking
    
    console.log("Transaction submitted!");
    console.log("Transaction ID:", response.transactionId);
    console.log("State:", response.state);
    console.log("");
    
    // Wait for transaction to be confirmed
    console.log("Waiting for confirmation...");
    const result = await relayer.waitForTransaction(
      response.transactionId,
      ["STATE_CONFIRMED"],  // Wait for confirmation
      "STATE_FAILED",       // Fail state
      60,                   // Max 60 polls
      2000                  // Check every 2 seconds
    );
    
    if (result) {
      console.log("Transaction confirmed!");
      console.log("Final state:", result.state);
      console.log("Transaction hash:", result.transactionHash);
    } else {
      console.log("Transaction failed!");
    }
  } catch (error: any) {
    console.error("Error executing transaction:", error.message);
  }
  */

  // Example 5: How to use relayer with Polymarket trading (ADVANCED)
  /*
  console.log("=== Using Relayer with Polymarket Trading ===");
  console.log("Note: This requires encoding Polymarket contract calls.\n");
  
  // To trade via relayer, you need to:
  // 1. Get the Polymarket contract address
  // 2. Encode the function call (e.g., placeOrder)
  // 3. Submit via relayer.executeProxyTransactions()
  // 
  // This is ADVANCED - most users should use sdk.trading.init() instead!
  
  // Example pseudocode:
  // const orderData = encodeOrderFunction(tokenId, side, price, size);
  // const response = await relayer.executeProxyTransactions([{
  //   to: POLYMARKET_CONTRACT_ADDRESS,
  //   typeCode: "1",
  //   data: orderData,
  //   value: "0"
  // }]);
  // await relayer.waitForTransaction(response.transactionId);
  */

  console.log("\n=== Example Complete ===");
  console.log("\nKey Points:");
  console.log("1. Relayer is for GASLESS transactions (relayer pays gas)");
  console.log("2. Most users should use sdk.trading.init() instead");
  console.log("3. Use relayer for: Web apps where you sponsor user gas");
  console.log("4. Don't use relayer for: Simple bots or personal trading");
  console.log("\nFor regular trading, see: examples/trading-example.ts");
  console.log("\nHappy building! 🚀");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
