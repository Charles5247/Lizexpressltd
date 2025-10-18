# Payment Implementation Guide

## Overview
This document provides a comprehensive guide for implementing and testing the payment system for LizExpress listings.

## Components Created

### 1. Core Payment Files
- `src/services/paymentService.ts` - Main payment service with Flutterwave integration
- `src/components/PaymentModal.tsx` - Enhanced payment modal with database integration
- `src/hooks/usePayment.ts` - Custom hook for payment state management
- `src/components/PaymentNotification.tsx` - User feedback notifications
- `src/components/PaymentStatus.tsx` - Payment status display component

### 2. Backend Infrastructure
- `supabase/functions/flutterwave-webhook/index.ts` - Webhook handler for payment verification
- `supabase/migrations/20250115000000_add_payments_table.sql` - Database schema for payments

### 3. Configuration
- `.env.example` - Environment variables template
- `.env.local` - Local development configuration

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and update with your actual Flutterwave keys:

```bash
# Development (Test Mode)
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-SANDBOXDEMOKEY-X
VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-SANDBOXDEMOKEY-X

# Production (Replace with actual keys)
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_PROD-YOUR_PRODUCTION_PUBLIC_KEY
VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK_PROD-YOUR_PRODUCTION_SECRET_KEY
```

### 2. Database Migration
Run the database migration to create the payments table:

```bash
supabase db push
```

### 3. Deploy Webhook Function
Deploy the Flutterwave webhook handler:

```bash
supabase functions deploy flutterwave-webhook
```

### 4. Configure Flutterwave Webhook
In your Flutterwave dashboard, set the webhook URL to:
```
https://your-project.supabase.co/functions/v1/flutterwave-webhook
```

## Testing

### 1. Test Payment Flow
```typescript
// Example usage in a component
import { usePayment } from '../hooks/usePayment';
import PaymentModal from '../components/PaymentModal';

const MyComponent = () => {
  const { paymentState, initiatePayment, verifyPayment } = usePayment();
  
  const handlePayment = async () => {
    const txRef = await initiatePayment({
      amount: 5000, // 5% of ₦100,000 item
      currency: 'NGN',
      user_id: user.id,
      item_id: 'item-uuid'
    });
    
    if (txRef) {
      // Open Flutterwave modal
      // Payment verification happens in callback
    }
  };
};
```

### 2. Test Cards (Flutterwave Sandbox)
Use these test card numbers for testing:

**Successful Payment:**
- Card Number: 4187427415564246
- CVV: 828
- Expiry: 09/32
- PIN: 3310

**Failed Payment:**
- Card Number: 4187427415564246
- CVV: 828
- Expiry: 09/32
- PIN: 3310

### 3. Webhook Testing
Test webhook locally using ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose local Supabase functions
ngrok http 54321

# Use the ngrok URL in Flutterwave webhook settings
```

## Payment Flow

### 1. User Initiates Payment
1. User clicks "Pay Now" in PaymentModal
2. `usePayment` hook creates payment record in database
3. Flutterwave modal opens with payment details

### 2. Payment Processing
1. User completes payment in Flutterwave modal
2. Flutterwave sends webhook to our backend
3. Webhook handler verifies payment and updates database
4. Item status changes to 'active' if payment successful

### 3. Payment Verification
1. Frontend receives payment callback
2. `paymentService.verifyPayment()` confirms with Flutterwave API
3. Payment status updated in database
4. User receives success notification

## Error Handling

### 1. Payment Failures
- Network errors: Retry mechanism with exponential backoff
- Invalid cards: Clear error messages to user
- Insufficient funds: Specific error handling
- Webhook failures: Manual verification process

### 2. Database Errors
- Connection issues: Graceful degradation
- Constraint violations: User-friendly error messages
- Transaction rollbacks: Automatic cleanup

## Security Considerations

### 1. Data Protection
- Never store sensitive payment data
- Use HTTPS for all payment communications
- Implement proper CORS policies

### 2. Webhook Security
- Verify webhook signatures (implement signature verification)
- Rate limiting on webhook endpoints
- Input validation and sanitization

### 3. Environment Security
- Use environment variables for sensitive data
- Separate test and production keys
- Regular key rotation

## Monitoring and Analytics

### 1. Payment Metrics
- Success/failure rates
- Average payment processing time
- Popular payment methods

### 2. Error Tracking
- Failed payment reasons
- Webhook processing errors
- User experience issues

## Troubleshooting

### Common Issues

1. **Payment Modal Not Opening**
   - Check Flutterwave script loading
   - Verify public key configuration
   - Check browser console for errors

2. **Webhook Not Receiving**
   - Verify webhook URL configuration
   - Check Supabase function deployment
   - Test with webhook testing tools

3. **Payment Verification Fails**
   - Check Flutterwave API connectivity
   - Verify secret key configuration
   - Review transaction reference format

### Debug Mode
Enable debug logging by setting:
```bash
VITE_DEBUG_PAYMENTS=true
```

## Production Checklist

- [ ] Replace test keys with production keys
- [ ] Configure production webhook URL
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts
- [ ] Implement proper error logging
- [ ] Configure backup payment methods
- [ ] Test webhook reliability
- [ ] Verify database performance
- [ ] Set up payment analytics
- [ ] Create user support documentation
