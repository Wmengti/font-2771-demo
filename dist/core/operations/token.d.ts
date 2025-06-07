import { type Hash } from 'viem';
import { BlockchainService } from '../blockchain';
/**
 * Token操作类
 * 负责处理ERC20代币的授权、检查等操作
 */
export declare class TokenOperations {
    private blockchainService;
    constructor(blockchainService: BlockchainService);
    /**
     * 授权代币
     * @param tokenAddress 代币地址
     * @param spender 被授权者地址
     * @param amount 授权金额
     * @returns 交易哈希
     */
    approveToken(tokenAddress: string, spender: string, amount: bigint): Promise<Hash>;
    /**
     * 检查授权额度
     * @param tokenAddress 代币地址
     * @param owner 代币持有者
     * @param spender 被授权者
     * @returns 当前授权额度
     */
    checkAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint>;
    /**
     * 确保代币授权额度充足
     * 如果授权不足会自动发起授权交易
     * @param tokenAddress 代币地址
     * @param spender 被授权者
     * @param amount 需要的授权额度
     * @returns 是否成功确保授权
     */
    ensureTokenAllowance(tokenAddress: string, spender: string, amount: bigint): Promise<boolean>;
    /**
     * 获取代币余额
     * @param tokenAddress 代币地址
     * @param owner 持有者地址，如不提供则使用当前连接的地址
     * @returns 代币余额
     */
    getTokenBalance(tokenAddress: string, owner?: string): Promise<bigint>;
}
