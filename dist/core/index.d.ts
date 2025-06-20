import { BlockchainConfig } from './blockchain';
import { TokenOperations } from './operations/token';
import { DirectPayment } from './operations/direct-payment';
import { RelayedPayment, RelayedRequestData } from './operations/relayed-payment';
import { VaultOperations } from './operations/vault';
import type { Hash } from 'viem';
import { MerchantConfigManager } from './merchant-config-manager';
import { TransactionService } from './transaction';
/**
 * Web3Delegate主类
 * 提供统一的接口来访问所有区块链操作功能
 */
export declare class Web3Delegate {
    private blockchainService;
    readonly token: TokenOperations;
    readonly directPayment: DirectPayment;
    readonly relayedPayment: RelayedPayment;
    readonly vault: VaultOperations;
    readonly merchantConfigManager: MerchantConfigManager;
    readonly transactionService: TransactionService;
    constructor(config?: BlockchainConfig);
    /**
     * 连接钱包
     * @returns 连接的钱包地址
     */
    connectWallet(): Promise<string>;
    /**
     * 检查钱包是否已连接
     * @returns 是否已连接
     */
    isConnected(): boolean;
    /**
     * 获取当前连接的钱包地址
     * @returns 当前连接的钱包地址
     */
    getConnectedAddress(): string | undefined;
    /**
     * 获取当前连接的链ID
     * @returns 当前连接的链ID
     */
    getChainId(): number | undefined;
    /**
     * ERC20代币授权
     * @param tokenAddress 代币地址
     * @param spender 被授权者地址
     * @param amount 授权金额
     * @returns 交易哈希
     */
    approveToken(tokenAddress: string, spender: string, amount: bigint): Promise<Hash>;
    /**
     * 检查代币授权额度
     * @param tokenAddress 代币地址
     * @param owner 代币持有者
     * @param spender 被授权者
     * @returns 授权额度
     */
    checkAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint>;
    /**
     * 确保代币授权额度充足
     * @param tokenAddress 代币地址
     * @param spender 被授权者
     * @param amount 需要的授权额度
     * @returns 是否授权成功
     */
    ensureTokenAllowance(tokenAddress: string, spender: string, amount: bigint): Promise<boolean>;
    /**
     * 用户直接支付（自己付gas）
     * @param to 接收方地址
     * @param amount 支付金额
     * @param tokenAddress 代币地址，如不提供则为原生代币
     * @param seq 序列号，默认为当前时间戳
     * @returns 交易哈希
     */
    userPayDirect(to: string, amount: bigint, tokenAddress?: string, seq?: bigint): Promise<Hash>;
    /**
     * 准备代付gas的支付请求（仅签名，不发送）
     * @param to 接收方地址
     * @param amount 支付金额
     * @param seq 序列号，默认为当前时间戳
     * @param tokenAddress 代币地址，如不提供则为原生代币
     * @param deadlineSeconds 过期时间（秒），默认3600秒
     * @returns 包含签名的请求数据
     */
    prepareRelayedPayment(to: string, amount: bigint, seq: bigint, tokenAddress?: string, deadlineSeconds?: number): Promise<RelayedRequestData>;
    /**
     * 向金库存款（用户付gas）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 存款金额
     * @returns 交易哈希
     */
    depositToVault(merchantId: string, tokenAddress: string, amount: bigint): Promise<Hash>;
    /**
     * 从金库提现（用户付gas）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 提现金额
     * @returns 交易哈希
     */
    withdrawFromVault(merchantId: string, tokenAddress: string, amount: bigint): Promise<Hash>;
    /**
     * 查询金库余额
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @returns 余额
     */
    getUserBalance(userAddress: string, merchantId: string, tokenAddress: string): Promise<bigint>;
    /**
     * 用户直接从金库消费（自己付gas）
     * @param merchantId 商家ID
     * @param tokenAddress 代币地址
     * @param amount 消费金额
     * @param voucherId 代金券ID
     * @param pointToUse 使用的积分
     * @param idx 由前端传入
     * @param seq 序列号
     * @param recipient 接收方地址
     * @returns 交易哈希
     */
    consumeFromVault(merchantId: string, tokenAddress: string, amount: bigint, voucherId: bigint | undefined, pointToUse: bigint | undefined, idx: bigint, seq?: bigint, recipient?: string): Promise<Hash>;
    /**
     * 准备代付gas的金库消费请求（仅签名，不发送）
     * @param merchantId 商家ID
     * @param tokenAddress 代币地址
     * @param amount 消费金额
     * @param voucherId 代金券ID
     * @param pointToUse 使用的积分
     * @param idx 由前端传入
     * @param seq 序列号
     * @param recipient 接收方地址
     * @param deadlineSeconds 过期时间（秒）
     * @returns 包含签名的请求数据
     */
    prepareRelayedConsume(merchantId: string, tokenAddress: string, amount: bigint, voucherId: bigint | undefined, pointToUse: bigint | undefined, idx: bigint, seq?: bigint, recipient?: string, deadlineSeconds?: bigint): Promise<RelayedRequestData>;
    /**
     * 准备代付gas的金库存款请求（仅签名，不发送）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 存款金额
     * @param deadlineSeconds 过期时间（秒）
     * @returns 包含签名的请求数据
     */
    prepareRelayedDeposit(merchantId: string, tokenAddress: string, amount: bigint, deadlineSeconds?: bigint): Promise<RelayedRequestData>;
    /**
     * 准备代付gas的金库提现请求（仅签名，不发送）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 提现金额
     * @param deadlineSeconds 过期时间（秒）
     * @returns 包含签名的请求数据
     */
    prepareRelayedWithdraw(merchantId: string, tokenAddress: string, amount: bigint, deadlineSeconds?: bigint): Promise<RelayedRequestData>;
}
export type { RelayedRequestData } from './operations/relayed-payment';
export type { ForwardRequestData } from './signing';
export type { BlockchainConfig } from './blockchain';
export { BlockchainService } from './blockchain';
export { TokenOperations } from './operations/token';
export { DirectPayment } from './operations/direct-payment';
export { RelayedPayment } from './operations/relayed-payment';
export { VaultOperations } from './operations/vault';
export { SigningService } from './signing';
export default Web3Delegate;
