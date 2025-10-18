// Payment service for handling Flutterwave payments
import { supabase } from '../lib/supabase';

export interface PaymentData {
  tx_ref: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed';
  user_id: string;
  item_id?: string;
  flutterwave_transaction_id?: string;
  created_at?: string;
}

export interface FlutterwaveWebhookData {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    card: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      token: string;
      expiry: string;
    };
    created_at: string;
    status: string;
    customer: {
      id: number;
      phone_number: string;
      name: string;
      email: string;
      created_at: string;
    };
    account: {
      id: number;
      account_id: string;
      account_number: string;
      bank_code: string;
      bank_name: string;
    };
  };
}

class PaymentService {
  // Create a payment record in the database
  async createPaymentRecord(paymentData: Omit<PaymentData, 'created_at'>): Promise<PaymentData> {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payment record: ${error.message}`);
    }

    return data;
  }

  // Update payment status
  async updatePaymentStatus(tx_ref: string, status: PaymentData['status'], flutterwave_transaction_id?: string): Promise<void> {
    const updateData: any = { status };
    if (flutterwave_transaction_id) {
      updateData.flutterwave_transaction_id = flutterwave_transaction_id;
    }

    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('tx_ref', tx_ref);

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  }

  // Get payment by transaction reference
  async getPaymentByTxRef(tx_ref: string): Promise<PaymentData | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tx_ref', tx_ref)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No payment found
      }
      throw new Error(`Failed to get payment: ${error.message}`);
    }

    return data;
  }

  // Verify payment with Flutterwave
  async verifyPayment(tx_ref: string): Promise<boolean> {
    try {
      const flutterwaveSecretKey = import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY;
      
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${tx_ref}/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${flutterwaveSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Flutterwave API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data.status === 'successful') {
        // Update payment status in database
        await this.updatePaymentStatus(tx_ref, 'successful', result.data.id.toString());
        return true;
      }

      return false;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  // Handle webhook from Flutterwave
  async handleWebhook(webhookData: FlutterwaveWebhookData): Promise<{ success: boolean; message: string }> {
    try {
      const { tx_ref, status, id } = webhookData.data;

      // Check if payment exists
      const existingPayment = await this.getPaymentByTxRef(tx_ref);
      
      if (!existingPayment) {
        return { success: false, message: 'Payment record not found' };
      }

      // Update payment status based on webhook
      if (status === 'successful') {
        await this.updatePaymentStatus(tx_ref, 'successful', id.toString());
        
        // If this is a listing payment, activate the item
        if (existingPayment.item_id) {
          await this.activateItem(existingPayment.item_id);
        }

        return { success: true, message: 'Payment processed successfully' };
      } else {
        await this.updatePaymentStatus(tx_ref, 'failed');
        return { success: false, message: 'Payment failed' };
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
      return { success: false, message: 'Webhook processing failed' };
    }
  }

  // Activate item after successful payment
  private async activateItem(item_id: string): Promise<void> {
    const { error } = await supabase
      .from('items')
      .update({ 
        status: 'active',
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', item_id);

    if (error) {
      throw new Error(`Failed to activate item: ${error.message}`);
    }
  }

  // Get user's payment history
  async getUserPayments(user_id: string): Promise<PaymentData[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user payments: ${error.message}`);
    }

    return data || [];
  }
}

export const paymentService = new PaymentService();
