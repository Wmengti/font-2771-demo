import { type Hash } from 'viem';
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
export interface SignedRequest extends ForwardRequestData {
    signature?: string;
}
export declare class TransactionService {
    private blockchainService;
    private signingService;
    constructor(blockchainService: BlockchainService);
    approveToken(tokenAddress: string, spender: string, amount: bigint): Promise<Hash>;
    checkAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint>;
    encodePayCallData(token: string, to: string, amount: bigint, // 金额
    seq?: bigint): `0x${string}`;
    userPayDirect(to: string, amount: bigint, tokenAddress?: string, seq?: bigint): Promise<Hash>;
    prepareRelayedPayment(to: string, amount: bigint, tokenAddress?: string, seq?: bigint, deadlineSeconds?: number): Promise<SignedRequest>;
    depositToVault(tokenAddress: string, amount: bigint): Promise<Hash>;
    withdrawFromVault(tokenAddress: string, amount: bigint): Promise<Hash>;
    consumeFromVault(merchantId: string, tokenAddress: string, amount: bigint, voucherId?: bigint, pointToUse?: bigint, seq?: bigint): Promise<Hash>;
    prepareRelayedConsume(merchantId: string, tokenAddress: string, amount: bigint, voucherId?: bigint, pointToUse?: bigint, seq?: bigint, deadlineSeconds?: number): Promise<SignedRequest>;
    prepareRelayedDeposit(tokenAddress: string, amount: bigint, deadlineSeconds?: number): Promise<SignedRequest>;
    prepareRelayedWithdraw(tokenAddress: string, amount: bigint, deadlineSeconds?: number): Promise<SignedRequest>;
}
