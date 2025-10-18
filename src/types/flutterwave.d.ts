// Global type declarations for Flutterwave
declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => void;
  }
}

// Flutterwave types
declare const FlutterwaveCheckout: (config: {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    phone_number: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: any) => void;
  onclose: () => void;
}) => void;

export {};
