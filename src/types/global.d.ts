import { WalletService, TransactionService, BlockchainService } from '../../dist';

declare global {
  interface Window {
    ethereum: any;
    WalletService: typeof WalletService;
    TransactionService: typeof TransactionService;
    BlockchainService: typeof BlockchainService;
  }
}

export {}; 