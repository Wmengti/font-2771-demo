export interface DelegateConfig {
    contractAddress: string;
    publicKey: string;
    useMetaMask?: boolean;
    consumeContractAddress?: string;
    forwarderAddress?: string;
}
export interface TransferParams {
    to: string;
    amount: bigint;
    tokenAddress?: string;
    gasFee?: bigint;
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
export interface MerchantContractConfig {
    promoTiersEnabled: boolean;
    promoTiers: PromoTier[];
    discountEnabled: boolean;
    discountBase: bigint;
    discountRate: bigint;
    cashbackPointEnabled: boolean;
    cashbackPointBase: bigint;
    cashbackPointAmount: bigint;
    cashbackVoucherEnabled: boolean;
    cashbackVoucherBase: bigint;
    cashbackVoucherAmount: bigint;
    voucherExpirePeriod: bigint;
}
export interface MerchantConfig {
    id: string;
    name: string;
    owner: string;
    operators: string[];
    paymentAddress: string;
    active: boolean;
    feePpm?: number;
    createdAt: number;
    updatedAt: number;
    maxAmount?: bigint;
    minAmount?: bigint;
    whitelistedTokens?: string[];
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
    gasFee?: bigint;
    consumerId?: string;
    merchantId?: string;
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
