import { type WalletClient, type PublicClient, type Account } from 'viem';
import { DelegateConfig } from '../types';
export declare class WalletService {
    protected wallet?: WalletClient;
    protected publicClient?: PublicClient;
    protected config: DelegateConfig;
    protected account?: Account;
    protected chainId?: number;
    constructor(config: DelegateConfig);
    /**
     * 初始化客户端
     * @returns 是否初始化成功
     */
    protected initializeClients(timeoutMs?: number): Promise<boolean>;
    /**
     * 连接钱包
     * @returns 连接的地址
     */
    connectWallet(timeoutMs?: number): Promise<string>;
    /**
     * 检查是否已连接钱包
     * @returns 是否已连接
     */
    isConnected(): boolean;
    /**
     * 获取当前连接的地址
     * @returns 连接的地址
     */
    getConnectedAddress(): string | undefined;
    /**
     * 获取当前连接的链ID
     * @returns 链ID
     */
    getChainId(): number | undefined;
    /**
     * 获取钱包客户端
     * @returns 钱包客户端
     */
    getWallet(): WalletClient | undefined;
    /**
     * 获取公共客户端
     * @returns 公共客户端
     */
    getPublicClient(): PublicClient | undefined;
    /**
     * 获取当前账户
     * @returns 账户
     */
    getAccount(): Account | undefined;
    /**
     * 确保钱包已连接，如果未连接则尝试连接
     * @returns 是否已连接
     */
    ensureConnected(timeoutMs?: number): Promise<boolean>;
    /**
     * 确保客户端已初始化，如果未初始化则尝试初始化
     * @returns 是否已初始化
     */
    ensureInitialized(timeoutMs?: number): Promise<boolean>;
}
