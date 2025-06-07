import { BlockchainService } from '../blockchain';
/**
 * 统一的中继请求数据格式
 */
export interface RelayedRequestData {
    from: string;
    to: string;
    value: string;
    gas: string;
    nonce: string;
    deadline: string;
    data: string;
    signature?: string;
}
/**
 * 中继支付类
 * 负责处理代付gas的支付操作，返回统一格式的签名数据
 */
export declare class RelayedPayment {
    private blockchainService;
    private tokenOperations;
    private directPayment;
    private signingService;
    constructor(blockchainService: BlockchainService);
    /**
     * 准备代付gas的支付请求（仅签名，不发送）
     * @param to 接收方地址
     * @param amount 支付金额
     * @param tokenAddress 代币地址，如不提供则为原生代币
     * @param seq 序列号，默认为当前时间戳
     * @param deadlineSeconds 过期时间（秒），默认3600秒
     * @returns 包含签名的中继请求数据
     */
    preparePayment(to: string, amount: bigint, tokenAddress?: string, seq?: bigint, deadlineSeconds?: number): Promise<RelayedRequestData>;
}
