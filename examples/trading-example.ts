/**
 * Trading Example - How to use POLYNOCTON SDK for trading on Polymarket
 * 
 * This example shows how to:
 * 1. Initialize the SDK with trading configuration
 * 2. Place a limit order
 * 3. Get open orders
 * 4. Cancel an order
 * 
 * IMPORTANT FOR NEWBIES:
 * - This is a BACKEND trading example (uses private key)
 * - NEVER expose your private key in frontend/browser code!
 * - For web apps, use the frontend mode with wallet connection instead
 * - You need USDC in your wallet to place orders
 * - Set your private key in the PRIVATE_KEY environment variable
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
    console.log("  npm run examples:trading");
    process.exit(1);
  }

  console.log("=== POLYNOCTON SDK Trading Example ===\n");

  // Initialize SDK with trading configuration
  const sdk = new POLYNOCTONSDK({
    debug: true,
    trading: {
      chainId: 137, // Polygon mainnet
      backend: {
        privateKey: privateKey,
      },
      // Optional: Add builder credentials for order attribution
      // builder: {
      //   key: process.env.BUILDER_KEY,
      //   secret: process.env.BUILDER_SECRET,
      //   passphrase: process.env.BUILDER_PASSPHRASE,
      // },
    },
  });

  // Initialize trading client
  console.log("Initializing trading client...");
  const trading = sdk.trading.init();
  console.log("Trading client initialized!");
  console.log("Wallet address:", trading.getWalletAddress());
  console.log("");

  // Example 1: Get open orders
  console.log("=== Fetching Open Orders ===");
  try {
    const openOrders = await trading.getOpenOrders();
    console.log(`You have ${openOrders.length} open order(s)`);
    
    if (openOrders.length > 0) {
      openOrders.forEach((order, i) => {
        console.log(`\nOrder ${i + 1}:`);
        console.log(`  ID: ${order.orderId}`);
        console.log(`  Side: ${order.side}`);
        console.log(`  Price: $${order.price}`);
        console.log(`  Size: ${order.size}`);
        console.log(`  Status: ${order.status}`);
      });
    }
  } catch (error: any) {
    console.error("Error getting open orders:", error.message);
  }
  console.log("");

  // Example 2: Place an order (COMMENTED OUT - uncomment to test)
  /*
  console.log("=== Placing an Order ===");
  try {
    // IMPORTANT: Replace these values with real market data!
    const tokenId = "YOUR_TOKEN_ID_HERE"; // Get from market data
    const side = "BUY"; // or "SELL"
    const price = 0.65; // Price between 0 and 1
    const size = 1; // Number of shares

    console.log(`Placing ${side} order for ${size} shares at $${price}...`);
    
    const order = await trading.placeOrder({
      tokenId,
      side,
      price,
      size,
    });

    console.log("Order placed successfully!");
    console.log("Order ID:", order.orderId);
    console.log("Status:", order.status);
  } catch (error: any) {
    console.error("Error placing order:", error.message);
  }
  console.log("");
  */

  // Example 3: Cancel an order (COMMENTED OUT - uncomment to test)
  /*
  console.log("=== Canceling an Order ===");
  try {
    const orderIdToCancel = "YOUR_ORDER_ID_HERE";
    
    console.log(`Canceling order ${orderIdToCancel}...`);
    await trading.cancelOrder(orderIdToCancel);
    console.log("Order canceled successfully!");
  } catch (error: any) {
    console.error("Error canceling order:", error.message);
  }
  */

  // Example 4: Complete trading workflow (COMMENTED OUT - uncomment to test)
  /*
  console.log("=== Complete Trading Workflow ===");
  try {
    // 1. Get market data first
    const markets = await sdk.getMarkets();
    const market = markets[0]; // Get first market
    console.log(`Trading on market: ${market.question}`);
    
    // 2. Get token ID for YES or NO
    // You need to inspect market.raw to find the token IDs
    console.log("Market outcomes:", market.outcomes);
    
    // 3. Place an order
    // ... (see Example 2 above)
    
    // 4. Wait a bit
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 5. Check if order was filled
    const orders = await trading.getOpenOrders();
    console.log(`Open orders after placing: ${orders.length}`);
    
    // 6. Cancel unfilled orders
    for (const order of orders) {
      console.log(`Canceling order ${order.orderId}...`);
      await trading.cancelOrder(order.orderId);
    }
    
    console.log("Workflow complete!");
  } catch (error: any) {
    console.error("Error in workflow:", error.message);
  }
  */

  console.log("\n=== Example Complete ===");
  console.log("\nNext steps:");
  console.log("1. Uncomment the examples above to test trading");
  console.log("2. Get real token IDs from market data");
  console.log("3. Make sure you have USDC in your wallet");
  console.log("4. Start with small orders to test!");
  console.log("\nHappy trading! 🚀");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
