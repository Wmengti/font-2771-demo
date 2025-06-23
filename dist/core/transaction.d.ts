import { type Hash } from 'viem';
import { BlockchainService } from './blockchain';
import { type RelayedRequestData } from './operations';
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
    private tokenOperations;
    private directPayment;
    private vaultOperations;
    private relayedPayment;
    constructor(blockchainService: BlockchainService);
    approveToken(tokenAddress: string, spender: string, amount: bigint): Promise<Hash>;
    checkAllowance(tokenAddress: string, owner: string, spender: string): Promise<bigint>;
    encodePayCallData(token: string, to: string, amount: bigint, // 金额
    seq?: bigint): `0x${string}`;
    userPayDirect(to: string, amount: bigint, tokenAddress?: string, seq?: bigint): Promise<Hash>;
    prepareRelayedPayment(to: string, amount: bigint, seq: bigint, tokenAddress: string, deadline: bigint): Promise<RelayedRequestData>;
    depositToVault(merchantId: bigint, tokenAddress: string, amount: bigint): Promise<Hash>;
    withdrawFromVault(merchantId: bigint, tokenAddress: string, amount: bigint): Promise<Hash>;
    consumeFromVault(merchantId: bigint, tokenAddress: string, amount: bigint, voucherId: bigint | undefined, pointToUse: bigint | undefined, idx: bigint, seq: bigint, recipient: string, userAddress: string): Promise<Hash>;
    getUserBalance(userAddress: string, merchantId: bigint, tokenAddress: string): Promise<bigint>;
    getUserPoints(userAddress: string, merchantId: bigint): Promise<bigint>;
    getSpecificUserPoints(userAddress: string, merchantId: bigint): Promise<bigint>;
    prepareRelayedConsume(merchantId: bigint, tokenAddress: string, amount: bigint, voucherId: bigint | undefined, pointToUse: bigint | undefined, idx: bigint, seq: bigint, recipient: string, deadline: bigint, userAddress: string): Promise<RelayedRequestData>;
    prepareRelayedDeposit(merchantId: bigint, tokenAddress: string, amount: bigint, deadline: bigint): Promise<RelayedRequestData>;
    prepareRelayedWithdraw(merchantId: bigint, tokenAddress: string, amount: bigint, deadline: bigint): Promise<RelayedRequestData>;
}
