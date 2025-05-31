import { PaymentDelegate } from '../../dist';

declare global {
  interface Window {
    ethereum?: any;
    PaymentDelegate?: typeof PaymentDelegate;
  }
} 