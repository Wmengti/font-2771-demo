import { BlockchainService } from './blockchain';
export interface ForwardRequestData {
    from: string;
    to: string;
    value: string;
    gas: string;
    nonce: string;
    deadline: string;
    data: string;
}
/**
 * 签名服务类
 * 负责处理EIP-712签名和验证
 */
export declare class SigningService {
    private blockchainService;
    constructor(blockchainService: BlockchainService);
    /**
     * 验证EIP-712签名
     */
    verifyTypedDataSignature({ chainId, message, signature, expectedSigner }: {
        chainId: number;
        message: any;
        signature: string;
        expectedSigner: string;
    }): Promise<{
        valid: boolean;
        signer: `0x${string}`;
    }>;
    /**
     * 生成 EIP-712 签名
     */
    signTypedData(request: ForwardRequestData, chainId: number, nonce: bigint): Promise<string>;
}
