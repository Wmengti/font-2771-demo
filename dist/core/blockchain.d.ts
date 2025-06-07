import { type WalletClient, type PublicClient, type Account } from 'viem';
export interface BlockchainConfig {
    useMetaMask?: boolean;
}
export declare class BlockchainService {
    private wallet?;
    private publicClient?;
    private account?;
    private chainId?;
    private config;
    constructor(config?: BlockchainConfig);
    private initializeClients;
    connectWallet(): Promise<string>;
    ensureWalletConnected(): Promise<void>;
    isConnected(): boolean;
    getConnectedAddress(): string | undefined;
    getChainId(): number | undefined;
    getAccount(): Account | undefined;
    getWalletClient(): WalletClient | undefined;
    getPublicClient(): PublicClient | undefined;
    ensureTokenAllowance(tokenAddress: string, spender: string, amount: bigint): Promise<boolean>;
    getNonce(address: string, options?: {
        timeout?: number;
    }): Promise<bigint>;
}
