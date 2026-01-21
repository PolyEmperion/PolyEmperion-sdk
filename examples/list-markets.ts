 import { POLYCAVORASDK } from "../src/client.js";

async function main() {
  const sdk = new POLYCAVORASDK({ debug: true });
  const markets = await sdk.getMarkets();
  console.log("Total markets:", markets.length);
  console.log("First market:", markets[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
