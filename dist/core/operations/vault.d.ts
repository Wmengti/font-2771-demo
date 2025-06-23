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
     * 将字符串转换为 bytes32 格式
     */
    private stringToBytes32;
    /**
     * 链下校验：检查代币是否在白名单
     */
    private validateTokenWhitelist;
    /**
     * 链下校验：检查金额是否大于0
     */
    private validateAmount;
    /**
     * 链下校验：检查商户是否设置
     */
    private validateMerchantRecipient;
    /**
     * 链下校验：检查序列号是否已使用
     */
    private validateSeq;
    /**
     * 向金库存款（用户付gas）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 存款金额
     * @returns 交易哈希
     */
    deposit(merchantId: string, tokenAddress: string, amount: bigint): Promise<Hash>;
    /**
     * 从金库提现（用户付gas）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 提现金额
     * @returns 交易哈希
     */
    withdraw(merchantId: string, tokenAddress: string, amount: bigint): Promise<Hash>;
    /**
     * 用户直接从金库消费（自己付gas）
     * @param merchantId 商户ID
     * @param tokenAddress 代币合约地址
     * @param amount 消费金额（最小单位）
     * @param voucherId 代金券ID（没有则填0n）
     * @param pointToUse 使用的积分数量（没有则填0n）
     * @param seq 消费序列号（建议用当前时间戳，保证唯一性）
     * @param idx 促销档位编号
     * @param recipient 商户收款地址
     * @param userAddress 用户地址（可选，默认当前钱包地址）
     * @returns 交易哈希
     */
    consumeDirect(merchantId: string, tokenAddress: string, amount: bigint, voucherId: bigint | undefined, pointToUse: bigint | undefined, seq: bigint | undefined, idx: bigint, recipient: string, userAddress: string): Promise<Hash>;
    /**
     * 校验代金券
     */
    private validateVoucher;
    /**
     * 余额跨商户转移
     * @param fromMerchantId 源商户ID
     * @param toMerchantId 目标商户ID
     * @param tokenAddress 代币地址
     * @param amount 转移金额
     * @returns 交易哈希
     */
    transferMerchantBalance(fromMerchantId: string, toMerchantId: string, tokenAddress: string, amount: bigint): Promise<Hash>;
    /**
     * 准备代付gas的消费请求（仅签名，不发送）
     * @param merchantId 商户ID
     * @param tokenAddress 代币合约地址
     * @param amount 消费金额（最小单位）
     * @param voucherId 代金券ID（没有则填0n）
     * @param pointToUse 使用的积分数量（没有则填0n）
     * @param seq 消费序列号（建议用当前时间戳，保证唯一性）
     * @param idx 促销档位编号
     * @param recipient 商户收款地址
     * @param deadline 过期时间戳（秒，bigint，必须是未来的绝对时间戳）
     * @param userAddress 用户地址（可选，默认当前钱包地址）
     * @returns 包含签名的中继请求数据
     */
    prepareRelayedConsume(merchantId: string, tokenAddress: string, amount: bigint, voucherId: bigint | undefined, pointToUse: bigint | undefined, seq: bigint | undefined, idx: bigint, recipient: string, deadline: bigint, userAddress: string): Promise<RelayedRequestData>;
    /**
     * 准备代付gas的存款请求（仅签名，不发送）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 存款金额
     * @param deadline 过期时间戳（秒，bigint，必须是未来的绝对时间戳）
     * @returns 包含签名的中继请求数据
     */
    prepareRelayedDeposit(merchantId: string, tokenAddress: string, amount: bigint, deadline: bigint): Promise<RelayedRequestData>;
    /**
     * 准备代付gas的提款请求（仅签名，不发送）
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @param amount 提款金额
     * @param deadline 过期时间戳（秒，bigint，必须是未来的绝对时间戳）
     * @returns 包含签名的中继请求数据
     */
    prepareRelayedWithdraw(merchantId: string, tokenAddress: string, amount: bigint, deadline: bigint): Promise<RelayedRequestData>;
    /**
     * 获取指定用户在指定商户的余额
     * @param userAddress 用户地址
     * @param merchantId 商户ID
     * @param tokenAddress 代币地址
     * @returns 余额
     */
    getUserBalance(userAddress: string, merchantId: string, tokenAddress: string): Promise<bigint>;
    /**
     * 获取指定用户在指定商户的积分
     * @param userAddress 用户地址
     * @param merchantId 商户ID
     * @returns 积分数量
     */
    getUserPoints(userAddress: string, merchantId: string): Promise<bigint>;
    /**
     * 获取当前用户的所有代金券
     * @returns 代金券信息
     */
    getMyVouchers(): Promise<{
        ids: bigint[];
        merchantIds: string[];
        tokens: string[];
        amounts: bigint[];
        used: boolean[];
        expireAts: bigint[];
    }>;
    /**
     * 获取指定代金券的详细信息
     * @param voucherId 代金券ID
     * @returns 代金券详情
     */
    getVoucher(voucherId: bigint): Promise<{
        merchantId: string;
        token: string;
        amount: bigint;
        used: boolean;
        expireAt: bigint;
    }>;
    /**
     * 获取手续费接收地址
     * @returns 手续费接收地址
     */
    getFeeReceiver(): Promise<string>;
    /**
     * 获取手续费规则提供者地址
     * @returns 手续费规则提供者地址
     */
    getFeeRuleProvider(): Promise<string>;
    /**
     * 获取可信转发器地址
     * @returns 可信转发器地址
     */
    getTrustedForwarder(): Promise<string>;
    /**
     * 检查是否为可信转发器
     * @param forwarderAddress 转发器地址
     * @returns 是否为可信转发器
     */
    isTrustedForwarder(forwarderAddress: string): Promise<boolean>;
    /**
     * 获取合约所有者地址
     * @returns 所有者地址
     */
    getOwner(): Promise<string>;
    /**
     * 查询商户活动档位详情（PromoTier）
     * @param merchantId 商户ID
     * @param idx 活动档位编号
     * @returns PromoTier 详情
     */
    getPromoTier(merchantId: string, idx: number): Promise<any>;
    /**
     * 消费主流程（consume）前端参数校验
     * @param params 消费参数
     * @throws 校验不通过抛出异常
     */
    validateConsumeParams(params: {
        merchantId: string;
        token: string;
        amount: bigint;
        voucherId: bigint;
        pointToUse: bigint;
        seq: bigint;
        idx: bigint;
        recipient: string;
        userAddress: string;
    }): Promise<void>;
}
