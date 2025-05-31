import { DelegateConfig, TransferParams } from '../types';
import { FORWARD_REQUEST_TYPES } from '../config/contract';
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
export declare class PaymentDelegate {
    private wallet?;
    private publicClient?;
    private config;
    private account?;
    private chainId?;
    constructor(config: DelegateConfig);
    private initializeClients;
    connectWallet(): Promise<string>;
    isConnected(): boolean;
    getConnectedAddress(): string | undefined;
    getChainId(): number | undefined;
    private encodePayCallData;
    ensureTokenAllowance(tokenAddress: string, owner: string, spender: string, amount: bigint): Promise<boolean>;
    processTransfer(params: TransferParams): Promise<any>;
    getNonce(address: string, options?: {
        timeout?: number;
    }): Promise<bigint>;
}
