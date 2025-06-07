import { type Hash } from 'viem';
import { BlockchainService } from '../blockchain';
import { RelayedRequestData } from './relayed-payment';
/**
 * Vault操作类
 * 负责处理UnifiedVault相关的存款、提现、消费操作
 */
export declare class VaultOperations {
    private blockchainService;
    private tokenOperations;
    private signingService;
    constructor(blockchainService: BlockchainService);
    /**
     * 向金库存款（用户付gas）
     * @param tokenAddress 代币地址
     * @param amount 存款金额
     * @returns 交易哈希
     */
    deposit(tokenAddress: string, amount: bigint): Promise<Hash>;
    /**
     * 从金库提现（用户付gas）
     * @param tokenAddress 代币地址
     * @param amount 提现金额
     * @returns 交易哈希
     */
    withdraw(tokenAddress: string, amount: bigint): Promise<Hash>;
    /**
     * 用户直接从金库消费（自己付gas）
     * @param merchantId 商家ID
     * @param tokenAddress 代币地址
     * @param amount 消费金额
     * @param voucherId 代金券ID
     * @param pointToUse 使用的积分
     * @param seq 序列号
     * @returns 交易哈希
     */
    consumeDirect(merchantId: string, tokenAddress: string, amount: bigint, voucherId?: bigint, pointToUse?: bigint, seq?: bigint): Promise<Hash>;
    /**
     * 准备代付gas的消费请求（仅签名，不发送）
     * @param merchantId 商家ID
     * @param tokenAddress 代币地址
     * @param amount 消费金额
     * @param voucherId 代金券ID
     * @param pointToUse 使用的积分
     * @param seq 序列号
     * @param deadlineSeconds 过期时间（秒），默认3600秒
     * @returns 包含签名的中继请求数据
     */
    prepareRelayedConsume(merchantId: string, tokenAddress: string, amount: bigint, voucherId?: bigint, pointToUse?: bigint, seq?: bigint, deadlineSeconds?: number): Promise<RelayedRequestData>;
    /**
     * 获取用户在金库中的余额
     * @param tokenAddress 代币地址
     * @param userAddress 用户地址，如不提供则使用当前连接的地址
     * @returns 余额
     */
    getVaultBalance(tokenAddress: string, userAddress?: string): Promise<bigint>;
    /**
     * 获取用户的积分
     * @param merchantId 商家ID
     * @param userAddress 用户地址，如不提供则使用当前连接的地址
     * @returns 积分数量
     */
    getUserPoints(merchantId: string, userAddress?: string): Promise<bigint>;
}
