# 🎓 POLYCAVORA SDK - Complete Guide for Newbies

Welcome! This guide will help you understand and use the POLYCAVORA SDK, even if you're new to programming or blockchain. We'll explain everything step by step.

---

## 📚 Table of Contents

1. [What is POLYCAVORA SDK?](#what-is-POLYCAVORA-sdk)
2. [What Can You Build?](#what-can-you-build)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Basic Concepts](#basic-concepts)
6. [Getting Started: Data & Streaming](#getting-started-data--streaming)
7. [Getting Started: Trading](#getting-started-trading)
8. [Common Use Cases](#common-use-cases)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## What is POLYCAVORA SDK?

**POLYCAVORA SDK** is a tool (software development kit) that lets you interact with **Polymarket** - a platform where people bet on real-world events.

Think of it like this:
- 🏛️ Polymarket is like a stock exchange, but for predictions
- 📱 The SDK is like an app on your phone that connects to that exchange
- 💻 You write code using the SDK to automate trading, get data, or build tools

### What Does It Do?

The SDK has **three main features**:

1. **📊 Data Fetching** - Get information about markets (like "Will it rain tomorrow?")
2. **🔴 Live Streaming** - Watch prices change in real-time
3. **💰 Trading** - Place bets (orders) automatically

---

## What Can You Build?

Here are some ideas:

### For Beginners
- 📈 **Market Dashboard** - Display current odds for interesting events
- 📊 **Price Tracker** - Monitor how predictions change over time
- 📧 **Alert System** - Get notified when odds hit certain levels

### For Intermediate Users
- 🤖 **Trading Bot** - Automatically place orders based on your strategy
- 📉 **Analytics Tool** - Analyze historical trends and patterns
- 🔍 **Market Scanner** - Find profitable trading opportunities

### For Advanced Users
- 🧠 **AI Agent** - Use AI to make predictions and trade automatically
- 💹 **Market Maker Bot** - Provide liquidity and earn from spreads
- 🌐 **Full Trading Platform** - Build a complete web app for trading

---

## Prerequisites

### What You Need

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org)
   - This lets you run JavaScript code on your computer

2. **A Code Editor**
   - We recommend [VS Code](https://code.visualstudio.com)
   - It's free and beginner-friendly

3. **Basic JavaScript/TypeScript Knowledge**
   - Don't worry! The examples are easy to follow
   - You'll learn as you go

### For Trading Features (Optional)

If you want to trade (not just get data), you'll also need:

4. **A Crypto Wallet**
   - With some USDC (a stablecoin) on Polygon network
   - MetaMask is popular and easy to use

5. **Your Wallet's Private Key**
   - **⚠️ SECURITY WARNING:** Never share this with anyone!
   - Only use it in secure, backend code (not websites)

---

## Installation

### Step 1: Create a New Project

Open your terminal and run:

```bash
# Create a new folder for your project
mkdir my-polymarket-bot
cd my-polymarket-bot

# Initialize a new Node.js project
npm init -y
```

### Step 2: Install the SDK

```bash
npm install @POLYCAVORA/sdk
```

### Step 3: Install WebSocket Support (for Node.js)

If you're building a backend/bot (not a website), you'll need this:

```bash
npm install ws
```

### Step 4: Install TypeScript (Recommended)

TypeScript makes coding easier by catching errors:

```bash
npm install --save-dev typescript tsx
```

### Step 5: Create Your First File

Create a file called `index.ts`:

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

console.log("Hello Polymarket! 🚀");
```

Run it:

```bash
npx tsx index.ts
```

You should see: `Hello Polymarket! 🚀`

Congratulations! 🎉 You're ready to start coding!

---

## Basic Concepts

Before we dive into code, let's understand some key terms:

### Markets
A **market** is a question people can bet on. Example:
- "Will Bitcoin reach $100k in 2025?"
- Two outcomes: YES or NO

### Tokens
Each outcome (YES/NO) is represented by a **token** with a unique ID.
- If you buy YES tokens and the answer is YES, you win!

### Orders
An **order** is your instruction to buy or sell tokens:
- **BUY order**: You want to buy YES tokens
- **SELL order**: You want to sell YES tokens
- **Price**: How much you're willing to pay (e.g., $0.65 = 65 cents)
- **Size**: How many tokens you want to trade

### Orderbook
The **orderbook** shows all buy and sell orders:
- **Bids**: People wanting to buy
- **Asks**: People wanting to sell

---

## Getting Started: Data & Streaming

Let's start with the simplest use case: getting market data.

### Example 1: Get All Markets

Create a file called `get-markets.ts`:

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

async function main() {
  // Create SDK instance (no config needed for data-only)
  const sdk = new POLYCAVORASDK();

  // Fetch all active markets
  const markets = await sdk.getMarkets();
  
  console.log(`Found ${markets.length} markets!`);
  
  // Show the first 5 markets
  markets.slice(0, 5).forEach((market, i) => {
    console.log(`\n${i + 1}. ${market.question}`);
    console.log(`   Status: ${market.status}`);
    console.log(`   Volume: $${market.volumeUsd?.toLocaleString()}`);
  });
}

main().catch(console.error);
```

Run it:

```bash
npx tsx get-markets.ts
```

**What's happening:**
1. We create an SDK instance
2. We call `getMarkets()` to fetch all markets
3. We print information about each market

### Example 2: Get a Specific Market

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

async function main() {
  const sdk = new POLYCAVORASDK();

  // Replace with a real market ID
  const marketId = "0x123...";
  
  const market = await sdk.getMarket(marketId);
  
  console.log(`Market: ${market.question}`);
  console.log(`Outcomes:`, market.outcomes);
  console.log(`Current prices:`, market.prices);
}

main().catch(console.error);
```

### Example 3: Stream Live Prices (WebSocket)

**IMPORTANT:** For WebSocket in Node.js, add this at the top:

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

// Enable WebSocket in Node.js
if (typeof window === "undefined") {
  globalThis.WebSocket = (await import("ws")).default as any;
}

async function main() {
  const sdk = new POLYCAVORASDK({ debug: true });

  const marketId = "0x123..."; // Replace with real ID

  console.log("Connecting to orderbook stream...");

  // Subscribe to live updates
  const unsubscribe = sdk.onOrderbook(
    marketId,
    (update) => {
      if (update.type === "snapshot") {
        // Initial orderbook state
        const { bids, asks } = update.data;
        console.log("\n=== Orderbook Snapshot ===");
        console.log("Best bid:", bids[0]?.price);
        console.log("Best ask:", asks[0]?.price);
      } else {
        // Price changed!
        console.log("Price update:", update.data);
      }
    },
    {
      onOpen: () => console.log("✅ Connected!"),
      onClose: () => console.log("❌ Disconnected"),
      onError: (err) => console.error("Error:", err),
    }
  );

  // Run for 30 seconds, then stop
  setTimeout(() => {
    unsubscribe();
    console.log("Stopped streaming.");
    process.exit(0);
  }, 30000);
}

main().catch(console.error);
```

**What's happening:**
1. We enable WebSocket support for Node.js
2. We subscribe to orderbook updates for a market
3. We get real-time price changes
4. We unsubscribe after 30 seconds

---

## Getting Started: Trading

Now let's learn how to place orders and trade!

### ⚠️ Important Security Notes

**NEVER do this:**
- ❌ Put your private key directly in your code
- ❌ Share your code with private keys on GitHub
- ❌ Use private keys in frontend/browser code

**ALWAYS do this:**
- ✅ Use environment variables for private keys
- ✅ Keep your private key secret
- ✅ Use backend mode only for servers/bots
- ✅ Use frontend mode for web apps (users use their own wallets)

### Setup: Get Your Private Key

**Where to find it:**
- MetaMask: Settings → Security & Privacy → Reveal Private Key
- Other wallets: Similar process

**How to use it safely:**

Create a `.env` file (this file is secret, never commit it):

```
PRIVATE_KEY=0x1234567890abcdef... (your actual key here)
```

Add `.env` to your `.gitignore`:

```
.env
```

### Example 1: Initialize Trading

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

// Load private key from environment
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error("Please set PRIVATE_KEY in your .env file");
}

const sdk = new POLYCAVORASDK({
  trading: {
    chainId: 137, // Polygon mainnet
    backend: {
      privateKey: privateKey,
    },
  },
});

// Initialize trading client
const trading = sdk.trading.init();

console.log("Trading ready!");
console.log("Your wallet:", trading.getWalletAddress());
```

### Example 2: Place Your First Order

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

async function main() {
  // Setup SDK (same as above)
  const sdk = new POLYCAVORASDK({
    trading: {
      chainId: 137,
      backend: {
        privateKey: process.env.PRIVATE_KEY!,
      },
    },
  });

  const trading = sdk.trading.init();

  // Place a buy order
  const order = await trading.placeOrder({
    tokenId: "0x123...", // Get from market data
    side: "BUY",
    price: 0.65, // Buy at 65 cents
    size: 10, // Buy 10 shares
  });

  console.log("Order placed!");
  console.log("Order ID:", order.orderId);
}

main().catch(console.error);
```

**What's happening:**
1. We initialize the SDK with trading config
2. We call `placeOrder()` with our parameters
3. The SDK signs and submits the order
4. We get back an order ID

### Example 3: Check Your Open Orders

```typescript
async function main() {
  // ... setup SDK and trading ...

  const openOrders = await trading.getOpenOrders();

  console.log(`You have ${openOrders.length} open orders`);

  openOrders.forEach((order) => {
    console.log(`\nOrder ${order.orderId}`);
    console.log(`  ${order.side} ${order.size} @ $${order.price}`);
    console.log(`  Status: ${order.status}`);
  });
}
```

### Example 4: Cancel an Order

```typescript
async function main() {
  // ... setup SDK and trading ...

  const orderId = "0xabc123...";

  await trading.cancelOrder(orderId);

  console.log("Order canceled!");
}
```

### Example 5: Complete Trading Flow

Here's a complete example that:
1. Gets market data
2. Places an order
3. Waits a bit
4. Cancels the order if not filled

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

async function main() {
  const sdk = new POLYCAVORASDK({
    trading: {
      chainId: 137,
      backend: { privateKey: process.env.PRIVATE_KEY! },
    },
  });

  const trading = sdk.trading.init();

  // 1. Get market data
  const markets = await sdk.getMarkets();
  const market = markets[0];
  console.log(`Trading on: ${market.question}`);

  // 2. Place an order (replace with real token ID!)
  const order = await trading.placeOrder({
    tokenId: "0x123...",
    side: "BUY",
    price: 0.55,
    size: 5,
  });

  console.log("Order placed:", order.orderId);

  // 3. Wait 10 seconds
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // 4. Check if still open
  const openOrders = await trading.getOpenOrders();
  const stillOpen = openOrders.find((o) => o.orderId === order.orderId);

  if (stillOpen) {
    console.log("Order not filled, canceling...");
    await trading.cancelOrder(order.orderId);
    console.log("Order canceled!");
  } else {
    console.log("Order was filled! 🎉");
  }
}

main().catch(console.error);
```

---

## Common Use Cases

### Use Case 1: Simple Price Alert Bot

Get notified when a market reaches a certain price:

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

// Enable WebSocket for Node.js
if (typeof window === "undefined") {
  globalThis.WebSocket = (await import("ws")).default as any;
}

const sdk = new POLYCAVORASDK();

const marketId = "0x123...";
const targetPrice = 0.70; // Alert when YES hits 70%

sdk.onOrderbook(marketId, (update) => {
  if (update.type === "snapshot") {
    const bestAsk = update.data.asks[0]?.price;
    
    if (bestAsk && bestAsk >= targetPrice) {
      console.log(`🚨 ALERT! Price reached ${bestAsk}`);
      // Send email, SMS, etc.
    }
  }
});
```

### Use Case 2: Market Maker Bot

Automatically provide liquidity:

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

async function marketMaker() {
  const sdk = new POLYCAVORASDK({
    trading: {
      chainId: 137,
      backend: { privateKey: process.env.PRIVATE_KEY! },
    },
  });

  const trading = sdk.trading.init();

  const tokenId = "0x123...";
  const spread = 0.02; // 2% spread
  const midPrice = 0.50;

  // Place buy order below mid
  await trading.placeOrder({
    tokenId,
    side: "BUY",
    price: midPrice - spread / 2,
    size: 10,
  });

  // Place sell order above mid
  await trading.placeOrder({
    tokenId,
    side: "SELL",
    price: midPrice + spread / 2,
    size: 10,
  });

  console.log("Market making orders placed!");
}

marketMaker().catch(console.error);
```

### Use Case 3: Arbitrage Scanner

Find price differences between markets:

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";

async function scanArbitrage() {
  const sdk = new POLYCAVORASDK();
  const markets = await sdk.getMarkets();

  // Find related markets
  const related = markets.filter((m) =>
    m.question.includes("Bitcoin")
  );

  // Compare prices
  related.forEach((market) => {
    const yesPrice = market.prices?.YES;
    const noPrice = market.prices?.NO;
    
    if (yesPrice && noPrice) {
      const total = yesPrice + noPrice;
      if (Math.abs(total - 1) > 0.05) {
        console.log(`⚡ Arbitrage opportunity!`);
        console.log(`Market: ${market.question}`);
        console.log(`YES: ${yesPrice}, NO: ${noPrice}`);
        console.log(`Total: ${total} (should be ~1.00)`);
      }
    }
  });
}

scanArbitrage().catch(console.error);
```

---

## Troubleshooting

### Common Errors

#### "Cannot find module '@POLYCAVORA/sdk'"

**Solution:** Make sure you installed the SDK:
```bash
npm install @POLYCAVORA/sdk
```

#### "WebSocket is not defined"

**Solution:** For Node.js, add this at the top:
```typescript
if (typeof window === "undefined") {
  globalThis.WebSocket = (await import("ws")).default as any;
}
```

And install ws:
```bash
npm install ws
```

#### "Trading is not configured"

**Solution:** You need to pass trading config:
```typescript
const sdk = new POLYCAVORASDK({
  trading: {
    chainId: 137,
    backend: { privateKey: process.env.PRIVATE_KEY! },
  },
});
```

#### "Failed to place order: insufficient balance"

**Solution:** You need USDC in your wallet:
1. Get USDC on Polygon network
2. Bridge from Ethereum if needed
3. Use a faucet for testing (testnet only)

#### "Order rejected: price out of range"

**Solution:** Prices must be between 0.01 and 0.99:
```typescript
// ❌ Wrong
price: 1.5

// ✅ Correct
price: 0.65 // 65 cents
```

### Getting Help

If you're stuck:

1. **Check the examples** - Look at the `examples/` folder
2. **Read the API docs** - Check the README for detailed API reference
3. **Open an issue** - https://github.com/POLYCAVORA/POLYCAVORA-sdk/issues
4. **Ask the community** - Join the POLYCAVORA Discord/Telegram

---

## FAQ

### Is this SDK only for data/market streaming?

**No!** The SDK now supports:
- ✅ Data fetching (markets, odds)
- ✅ Real-time streaming (orderbook updates)
- ✅ **Trading** (place, cancel, manage orders) - NEW!

You can use just the data features without trading, or use everything together.

### Why do I need builder config? How is it used?

**Builder config is OPTIONAL** but recommended if you're:
- Building a trading bot that places many orders
- Running a market maker
- Wanting analytics on your order flow

**Benefits:**
- Track your orders in Polymarket's builder dashboard
- Potential fee rebates
- Build reputation as a market maker

**How it's used:**
- Backend mode: Pass your builder credentials (key, secret, passphrase)
- Frontend mode: Use a signing server URL

Contact Polymarket to get builder credentials.

### Backend vs Frontend mode - which should I use?

**Use Backend Mode if:**
- Building a trading bot/server
- Running automated strategies
- You control the private key

**Use Frontend Mode if:**
- Building a web app
- Users connect their own wallets
- You want users to sign their own transactions

**Security:**
- Backend: Private key is on server (secure server required!)
- Frontend: Users control their own keys (more secure for users)

### How do I get a token ID?

Token IDs are in the market data:

```typescript
const sdk = new POLYCAVORASDK();
const market = await sdk.getMarket("market-id");

// Token IDs are in the raw data
console.log(market.raw);

// Usually there are 2 tokens: one for YES, one for NO
// You'll see something like:
// { id: "0x123...", outcome: "YES" }
// { id: "0x456...", outcome: "NO" }
```

### Can I use this in a web browser?

**Yes!** For frontend/browser usage:

1. Use a bundler (Vite, Next.js, etc.)
2. Use frontend trading mode with wallet connection:

```typescript
import { POLYCAVORASDK } from "@POLYCAVORA/sdk";
import { ethers } from "ethers";

// Connect to user's wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = provider.getSigner();

// Initialize SDK with frontend mode
const sdk = new POLYCAVORASDK({
  trading: {
    chainId: 137,
    frontend: { signer },
  },
});

const trading = sdk.trading.init();
await trading.placeOrder({...});
```

### Do I need USDC to trade?

**Yes!** You need USDC (a stablecoin) on Polygon network:

1. Buy USDC on an exchange (Coinbase, Binance, etc.)
2. Withdraw to Polygon network
3. Or bridge from Ethereum using a bridge

### Is there a testnet?

Polymarket primarily operates on Polygon mainnet. However, you can:
- Test with small amounts (like $1-5)
- Use the SDK's data features without trading
- Build and test your logic before trading real money

### How much does it cost to trade?

Costs include:
- **Gas fees**: Very low on Polygon (~$0.01 per transaction)
- **Trading fees**: Polymarket may charge small fees
- **Spread**: Difference between buy and sell prices

Always start with small amounts to understand costs!

### Can I make money with this?

**Potentially, but it's risky!** Trading prediction markets involves:
- ✅ Opportunities for profit if you have good strategies
- ❌ Risk of losing money
- ⚠️ Competition from other bots and traders

**Tips for beginners:**
- Start small
- Test your strategies
- Don't risk money you can't afford to lose
- Learn from the community

---

## Next Steps

Congratulations on making it through the guide! 🎉

**Here's what to do next:**

1. **Try the examples** - Run the example files in `examples/`
2. **Build something simple** - Start with a market scanner
3. **Learn more** - Read the full API docs in README.md
4. **Join the community** - Connect with other builders
5. **Share your project** - Show us what you build!

**Resources:**
- 📖 Full API Reference: [README.md](./README.md)
- 💻 Example Code: [examples/](./examples/)
- 🐛 Report Issues: [GitHub Issues](https://github.com/POLYCAVORA/POLYCAVORA-sdk/issues)
- 🌐 Website: [POLYCAVORA.xyz](https://POLYCAVORA.xyz)

**Happy building! 🚀**

---

*Made with ❤️ by the POLYCAVORA team for the prediction market community*
