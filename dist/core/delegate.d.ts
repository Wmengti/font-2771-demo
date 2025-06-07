import { DelegateConfig, TransferParams } from '../types';
import { FORWARD_REQUEST_TYPES } from '../config/contract';
/**
 * 为向后兼容而保留的类
 * 使用新的Web3Delegate作为底层实现
 */
export declare class PaymentDelegate {
    private delegate;
    private config;
    constructor(config: DelegateConfig);
    /**
     * 连接钱包
     */
    connectWallet(): Promise<string>;
    /**
     * 检查是否已连接钱包
     */
    isConnected(): boolean;
    /**
     * 获取当前连接的地址
     */
    getConnectedAddress(): string | undefined;
    /**
     * 获取当前连接的链ID
     */
    getChainId(): number | undefined;
    /**
     * 旧的处理转账方法，为了向后兼容而保留
     * 使用新架构下的代付gas支付功能
     */
    processTransfer(params: TransferParams): Promise<any>;
    /**
     * 获取Token操作实例
     */
    get token(): import("./index").TokenOperations;
    /**
     * 获取直接支付操作实例
     */
    get directPayment(): import("./index").DirectPayment;
    /**
     * 获取代付gas支付操作实例
     */
    get relayedPayment(): import("./index").RelayedPayment;
    /**
     * 获取金库操作实例
     */
    get vault(): import("./index").VaultOperations;
}
export declare function verifyTypedDataSignature({ chainId, types, message, signature, expectedSigner }: {
    chainId: number;
    types?: typeof FORWARD_REQUEST_TYPES;
    message: any;
    signature: string;
    expectedSigner: string;
}): Promise<{
    valid: boolean;
    signer: `0x${string}`;
}>;
