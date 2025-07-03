export interface DelegateConfig {
    paymentContractAddress?: string;
    vaultContractAddress?: string;
    forwarderAddress?: string;
    rpcUrl?: string;
}
export interface TransferParams {
    to: string;
    amount: bigint;
    tokenAddress?: string;
    seq?: bigint;
    contractAddress?: string;
    payer?: string;
}
export interface ProcessResult {
    request: {
        from: string;
        to: string;
        value: string;
        gas: string;
        nonce: string;
        deadline: string;
        data: string;
        signature?: string;
    };
}
export interface EncryptionResult {
    encryptedKey: string;
    encryptedData: string;
    iv: string;
}
export interface Call {
    data: `0x${string}`;
    to: string;
    value: bigint;
}
export interface PromoTier {
    minAmount: bigint;
    discountRate: bigint;
    voucherAmount: bigint;
    pointAmount: bigint;
}
export declare enum OperationType {
    Payment = "payment",// 支付操作
    Consume = "consume",// 消费操作
    Deposit = "deposit",// 存款操作
    Withdraw = "withdraw"
}
export interface RelayerRequest {
    from: string;
    to: string;
    token: string;
    amount: bigint;
    seq: bigint;
    consumerId?: string;
    merchantId?: bigint;
    voucherId?: bigint;
    pointToUse?: bigint;
    signature: string;
    deadline: number;
    data?: `0x${string}`;
    value?: string;
    gas?: string;
}
export interface ValidationResult {
    success: boolean;
    error?: string;
    fee?: bigint;
    toAmount?: bigint;
    rewardAmount?: bigint;
    merchantAmount?: bigint;
    voucherReward?: bigint;
    discountedAmount?: bigint;
    pointsUsed?: bigint;
    voucherUsed?: bigint;
    spendAmount?: bigint;
}
export interface MerchantOperationResult {
    success: boolean;
    message: string;
    data?: any;
}
