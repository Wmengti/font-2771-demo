export interface DelegateConfig {
    contractAddress: string;
    publicKey: string;
    useMetaMask?: boolean;
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
