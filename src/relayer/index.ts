/**
 * Relayer module for Polymarket gasless/meta transactions.
 * 
 * This module wraps the @polymarket/relayer-client to enable gasless trading
 * where the relayer service pays gas fees on behalf of users.
 * 
 * NOTE FOR NEWBIES:
 * - Relayer = A service that pays blockchain gas fees for you
 * - Use case: Enable gasless trading for your users (better UX)
 * - Most bots DON'T need this - use regular trading instead
 * - This is for ADVANCED production apps with many users
 * 
 * WHEN TO USE RELAYER:
 * ✅ Building a web app where you want to pay gas for users
 * ✅ Creating sponsored trading experiences
 * ✅ Meta-transactions and delegated trading
 * 
 * WHEN NOT TO USE RELAYER:
 * ❌ Simple trading bots (use TradingClient instead)
 * ❌ Personal trading (just pay your own gas)
 * ❌ Testing/development (use regular trading)
 */

import { RelayClient } from "@polymarket/relayer-client";
import { ethers } from "ethers";
import type { RelayerConfig, RelayerTransactionResponse } from "../types.js";

// Default Polymarket relayer URL (check Polymarket docs for current URL)
const DEFAULT_RELAYER_URL = "https://relayer.polymarket.com";

/**
 * Relayer client for submitting gasless transactions.
 * 
 * This client allows you to execute transactions through a relayer service
 * that pays the gas fees, enabling gasless trading experiences.
 * 
 * @example
 * ```typescript
 * const sdk = new POLYNOCTONSDK({
 *   relayer: {
 *     chainId: 137,
 *     backend: { privateKey: "0x..." }
 *   }
 * });
 * 
 * const relayer = sdk.relayer.init();
 * 
 * // Submit a gasless transaction
 * const response = await relayer.executeTransaction([{
 *   to: "0x...",
 *   data: "0x...",
 *   value: "0"
 * }]);
 * 
 * // Wait for transaction to be mined
 * await relayer.waitForTransaction(response.transactionId);
 * ```
 */
export class RelayerClient {
  private client: RelayClient;
  private config: RelayerConfig;
  private walletAddress?: string;

  constructor(config: RelayerConfig) {
    this.config = config;

    // Validate configuration
    if (!config.backend && !config.frontend) {
      throw new Error(
        "Relayer configuration must include either 'backend' or 'frontend' mode. " +
        "For automated systems use 'backend' with privateKey. " +
        "For web apps use 'frontend' with signer."
      );
    }

    const relayerUrl = config.relayerUrl || DEFAULT_RELAYER_URL;
    const chainId = config.chainId || 137; // Polygon mainnet

    // Backend mode: using private key
    if (config.backend?.privateKey) {
      const wallet = new ethers.Wallet(config.backend.privateKey);
      this.walletAddress = wallet.address;

      // Create relayer client with optional auth
      if (config.auth) {
        this.client = new RelayClient(
          relayerUrl,
          chainId,
          wallet as any,
          config.auth
        );
      } else {
        this.client = new RelayClient(relayerUrl, chainId, wallet as any);
      }
    }
    // Frontend mode: using provided signer
    else if (config.frontend?.signer) {
      const signer = config.frontend.signer;

      // Get wallet address from signer
      if (typeof signer.getAddress === "function") {
        signer.getAddress().then((addr: string) => {
          this.walletAddress = addr;
        });
      }

      // Create relayer client with optional auth
      if (config.auth) {
        this.client = new RelayClient(relayerUrl, chainId, signer, config.auth);
      } else {
        this.client = new RelayClient(relayerUrl, chainId, signer);
      }
    } else {
      throw new Error("Invalid relayer configuration");
    }
  }

  /**
   * Get the relayer's address.
   * 
   * This is the address that will execute transactions on your behalf.
   * 
   * @returns Promise resolving to the relayer address
   * 
   * @example
   * ```typescript
   * const relayerAddress = await relayer.getRelayerAddress();
   * console.log("Relayer address:", relayerAddress);
   * ```
   */
  async getRelayerAddress(): Promise<string> {
    try {
      const response = await this.client.getRelayAddress();
      return response.address;
    } catch (error: any) {
      throw new Error(`Failed to get relayer address: ${error.message}`);
    }
  }

  /**
   * Get the current nonce for a signer.
   * 
   * Nonces are used to prevent transaction replay attacks.
   * 
   * @param signerAddress - The signer's address (optional, uses your address if not provided)
   * @param signerType - Type of signer (default: "EOA" for Externally Owned Account)
   * @returns Promise resolving to the nonce
   * 
   * @example
   * ```typescript
   * const nonce = await relayer.getNonce();
   * console.log("Current nonce:", nonce);
   * ```
   */
  async getNonce(signerAddress?: string, signerType: string = "EOA"): Promise<string> {
    try {
      const address = signerAddress || this.walletAddress;
      if (!address) {
        throw new Error("No wallet address available. Provide an address or ensure wallet is initialized.");
      }

      const response = await this.client.getNonce(address, signerType);
      return response.nonce;
    } catch (error: any) {
      throw new Error(`Failed to get nonce: ${error.message}`);
    }
  }

  /**
   * Execute proxy transactions through the relayer (gasless).
   * 
   * Proxy transactions are the most common type for gasless trading.
   * The relayer executes these transactions and pays the gas fees.
   * 
   * @param transactions - Array of transactions to execute
   * @param metadata - Optional metadata for tracking
   * @returns Promise resolving to transaction response
   * 
   * @example
   * ```typescript
   * const response = await relayer.executeProxyTransactions([
   *   {
   *     to: "0x123...",      // Contract to call
   *     typeCode: "1",       // Call type (1 = Call)
   *     data: "0xabc...",    // Encoded function call
   *     value: "0"           // ETH value (usually "0")
   *   }
   * ]);
   * 
   * console.log("Transaction submitted:", response.transactionId);
   * ```
   */
  async executeProxyTransactions(
    transactions: Array<{
      to: string;
      typeCode: string;
      data: string;
      value: string;
    }>,
    metadata?: string
  ): Promise<RelayerTransactionResponse> {
    try {
      const response = await this.client.executeProxyTransactions(
        transactions as any,
        metadata
      );

      return {
        transactionId: response.transactionID,
        state: response.state,
        hash: response.hash,
        transactionHash: response.transactionHash,
      };
    } catch (error: any) {
      throw new Error(`Failed to execute proxy transactions: ${error.message}`);
    }
  }

  /**
   * Execute Safe (multi-sig) transactions through the relayer.
   * 
   * Safe transactions are for Gnosis Safe multi-signature wallets.
   * Use this if you're working with Safe wallets.
   * 
   * @param transactions - Array of Safe transactions to execute
   * @param metadata - Optional metadata for tracking
   * @returns Promise resolving to transaction response
   * 
   * @example
   * ```typescript
   * const response = await relayer.executeSafeTransactions([
   *   {
   *     to: "0x123...",
   *     operation: 0,        // 0 = Call, 1 = DelegateCall
   *     data: "0xabc...",
   *     value: "0"
   *   }
   * ]);
   * ```
   */
  async executeSafeTransactions(
    transactions: Array<{
      to: string;
      operation: number;
      data: string;
      value: string;
    }>,
    metadata?: string
  ): Promise<RelayerTransactionResponse> {
    try {
      const response = await this.client.executeSafeTransactions(
        transactions as any,
        metadata
      );

      return {
        transactionId: response.transactionID,
        state: response.state,
        hash: response.hash,
        transactionHash: response.transactionHash,
      };
    } catch (error: any) {
      throw new Error(`Failed to execute safe transactions: ${error.message}`);
    }
  }

  /**
   * Deploy a Gnosis Safe wallet through the relayer.
   * 
   * This creates a new Safe multi-sig wallet for you.
   * Only needed if you're using Safe wallets.
   * 
   * @returns Promise resolving to transaction response
   * 
   * @example
   * ```typescript
   * const response = await relayer.deploySafe();
   * console.log("Safe deployed:", response.transactionId);
   * ```
   */
  async deploySafe(): Promise<RelayerTransactionResponse> {
    try {
      const response = await this.client.deploySafe();

      return {
        transactionId: response.transactionID,
        state: response.state,
        hash: response.hash,
        transactionHash: response.transactionHash,
      };
    } catch (error: any) {
      throw new Error(`Failed to deploy safe: ${error.message}`);
    }
  }

  /**
   * Get the status of a relayer transaction.
   * 
   * Transaction states:
   * - STATE_NEW: Just submitted
   * - STATE_EXECUTED: Sent to blockchain
   * - STATE_MINED: Included in a block
   * - STATE_CONFIRMED: Confirmed on blockchain
   * - STATE_FAILED: Transaction failed
   * 
   * @param transactionId - The relayer transaction ID
   * @returns Promise resolving to transaction details
   * 
   * @example
   * ```typescript
   * const txs = await relayer.getTransaction(response.transactionId);
   * console.log("Transaction state:", txs[0].state);
   * ```
   */
  async getTransaction(transactionId: string): Promise<any[]> {
    try {
      return await this.client.getTransaction(transactionId);
    } catch (error: any) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Get all transactions submitted by your wallet.
   * 
   * @returns Promise resolving to array of transactions
   * 
   * @example
   * ```typescript
   * const transactions = await relayer.getTransactions();
   * console.log(`You have ${transactions.length} transactions`);
   * ```
   */
  async getTransactions(): Promise<any[]> {
    try {
      return await this.client.getTransactions();
    } catch (error: any) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  /**
   * Wait for a transaction to reach a desired state.
   * 
   * This polls the relayer until the transaction is confirmed or fails.
   * Useful for waiting for transaction completion.
   * 
   * @param transactionId - The transaction ID to wait for
   * @param desiredStates - States to wait for (default: ["STATE_CONFIRMED"])
   * @param failState - State that indicates failure (default: "STATE_FAILED")
   * @param maxPolls - Maximum number of polls (default: 60)
   * @param pollFrequency - Time between polls in ms (default: 2000)
   * @returns Promise resolving to transaction or undefined if failed
   * 
   * @example
   * ```typescript
   * // Submit transaction
   * const response = await relayer.executeProxyTransactions([...]);
   * 
   * // Wait for confirmation
   * const result = await relayer.waitForTransaction(response.transactionId);
   * 
   * if (result) {
   *   console.log("Transaction confirmed!");
   * } else {
   *   console.log("Transaction failed!");
   * }
   * ```
   */
  async waitForTransaction(
    transactionId: string,
    desiredStates: string[] = ["STATE_CONFIRMED"],
    failState: string = "STATE_FAILED",
    maxPolls: number = 60,
    pollFrequency: number = 2000
  ): Promise<any | undefined> {
    try {
      return await this.client.pollUntilState(
        transactionId,
        desiredStates,
        failState,
        maxPolls,
        pollFrequency
      );
    } catch (error: any) {
      throw new Error(`Failed to wait for transaction: ${error.message}`);
    }
  }

  /**
   * Get the wallet address being used for relayer transactions.
   * 
   * @returns The wallet address or undefined if not yet initialized
   */
  getWalletAddress(): string | undefined {
    return this.walletAddress;
  }

  /**
   * Get the underlying relay client for advanced usage.
   * 
   * NOTE: This is for advanced users who need direct access to the relay client.
   * Most users should use the methods provided by RelayerClient instead.
   * 
   * @returns The underlying RelayClient instance
   */
  getRawClient(): RelayClient {
    return this.client;
  }
}

/**
 * Create a new relayer client instance.
 * 
 * @param config - Relayer configuration
 * @returns A new RelayerClient instance
 * 
 * NOTE FOR NEWBIES:
 * This is the main entry point for relayer functionality.
 * You'll typically call this via `sdk.relayer.init()` rather than directly.
 */
export function createRelayerClient(config: RelayerConfig): RelayerClient {
  return new RelayerClient(config);
}
