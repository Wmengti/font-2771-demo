import { type Hash } from 'viem';
import { BlockchainService } from '../blockchain';
/**
 * 直接支付类
 * 负责处理用户付gas的直接支付操作
 */
export declare class DirectPayment {
    private blockchainService;
    private tokenOperations;
    constructor(blockchainService: BlockchainService);
    /**
     * 用户直接支付（自己付gas）
     * @param to 接收方地址
     * @param amount 支付金额
     * @param tokenAddress 代币地址，如不提供则为原生代币(ETH)
     * @param seq 序列号，默认为当前时间戳
     * @returns 交易哈希
     */
    pay(to: string, amount: bigint, tokenAddress?: string, seq?: bigint): Promise<Hash>;
    /**
     * 编码支付函数调用数据
     * @param token 代币地址
     * @param to 接收方地址
     * @param amount 金额
     * @param seq 序列号
     * @returns 编码后的调用数据
     */
    encodePayCallData(token: string, to: string, amount: bigint, seq?: bigint): `0x${string}`;
}
