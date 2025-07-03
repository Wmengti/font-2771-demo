import { DelegateConfig, OperationType, ValidationResult } from '../types';
import { BlockchainService } from './blockchain';
export interface SimpleRelayerRequest {
    from: string;
    to: string;
    value: string;
    gas: string;
    deadline: string;
    data: string;
    signature: string;
}
export declare class RelayerService extends BlockchainService {
    private paymentContractAddress;
    private consumeContractAddress;
    private forwarderAddress;
    constructor(config: DelegateConfig);
    /**
     * 验证支付请求
     * @param params 请求参数
     * @returns 验证结果
     */
    validatePaymentRequest(params: {
        token: string;
        to: string;
        amount: bigint;
        seq: bigint;
        from: string;
    }): Promise<ValidationResult>;
    /**
     * 验证消费请求
     * @param params 请求参数
     * @returns 验证结果
     */
    validateConsumeRequest(params: {
        token: string;
        merchantId: bigint;
        amount: bigint;
        seq: bigint;
        idx: bigint;
        recipient: string;
        from: string;
        voucherId?: bigint;
        pointToUse?: bigint;
    }): Promise<ValidationResult>;
    /**
     * 验证存款请求
     * @param params 请求参数
     * @returns 验证结果
     */
    validateDepositRequest(params: {
        token: string;
        amount: bigint;
        seq: bigint;
        from: string;
    }): Promise<ValidationResult>;
    /**
     * 验证提款请求
     * @param params 请求参数
     * @returns 验证结果
     */
    validateWithdrawRequest(params: {
        token: string;
        amount: bigint;
        seq: bigint;
        from: string;
    }): Promise<ValidationResult>;
    /**
     * 编码支付调用数据
     * @param token 代币地址
     * @param to 接收方地址
     * @param amount 金额
     * @param seq 序列号
     * @returns 编码后的调用数据
     */
    private encodePayCallData;
    /**
     * 编码消费调用数据
     * @param merchantId 商家ID
     * @param token 代币地址
     * @param amount 金额
     * @param voucherId 代金券ID
     * @param pointToUse 使用的积分
     * @param seq 序列号
     * @returns 编码后的调用数据
     */
    private encodeConsumeCallData;
    /**
     * 编码存款调用数据
     * @param token 代币地址
     * @param amount 金额
     * @returns 编码后的调用数据
     */
    private encodeDepositCallData;
    /**
     * 编码提款调用数据
     * @param token 代币地址
     * @param amount 金额
     * @returns 编码后的调用数据
     */
    private encodeWithdrawCallData;
    /**
     * 获取nonce
     * @param address 地址
     * @param options 选项
     * @returns nonce
     */
    getNonce(address: string, options?: {
        timeout?: number;
    }): Promise<bigint>;
    /**
     * 解析请求数据并根据操作类型进行验证
     * @param type 操作类型
     * @param request 简化的请求数据
     * @returns 验证结果
     */
    validateSimpleRequest(type: OperationType, request: SimpleRelayerRequest): Promise<ValidationResult>;
    /**
     * 使用简化接口发送请求
     * @param type 操作类型
     * @param request 简化的请求数据
     * @returns 发送结果
     */
    sendSimpleRequest(type: OperationType, request: SimpleRelayerRequest): Promise<{
        success: boolean;
        txHash?: string;
        error?: string;
    }>;
    /**
     * 解析支付函数调用数据
     * @param data 调用数据
     * @returns 解析后的参数
     */
    private decodePaymentData;
    /**
     * 解析消费函数调用数据
     * @param data 调用数据
     * @returns 解析后的参数
     */
    private decodeConsumeData;
    /**
     * 解析存款函数调用数据
     * @param data 调用数据
     * @returns 解析后的参数
     */
    private decodeDepositData;
    /**
     * 解析提款函数调用数据
     * @param data 调用数据
     * @returns 解析后的参数
     */
    private decodeWithdrawData;
}
