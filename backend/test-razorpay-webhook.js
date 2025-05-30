#!/usr/bin/env node

import fetch from 'node-fetch';
import crypto from 'crypto';

// Authentic Razorpay webhook events for testing
const testEvents = {
  paymentCaptured: {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test123456789',
          amount: 250000, // ₹2500 in paisa
          currency: 'INR',
          status: 'captured',
          order_id: 'order_test123456789',
          invoice_id: null,
          international: false,
          method: 'card',
          amount_refunded: 0,
          refund_status: null,
          captured: true,
          description: 'Train booking payment',
          card_id: 'card_test123',
          bank: 'HDFC',
          wallet: null,
          vpa: null,
          email: 'test@example.com',
          contact: '+919876543210',
          notes: {
            userId: '675b5b0123456789abcdef01',
            trainNumber: '12951',
            from: 'NEW DELHI',
            to: 'CHHATRAPATI SHIVAJI TERMINUS',
            journeyDate: '2025-05-30'
          },
          fee: 5900,
          tax: 900,
          error_code: null,
          error_description: null,
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  paymentFailed: {
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: 'pay_failed123456789',
          amount: 250000,
          currency: 'INR',
          status: 'failed',
          order_id: 'order_test123456789',
          method: 'card',
          captured: false,
          description: 'Train booking payment',
          email: 'test@example.com',
          contact: '+919876543210',
          error_code: 'BAD_REQUEST_ERROR',
          error_description: 'Payment failed due to insufficient funds',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  paymentAuthorized: {
    event: 'payment.authorized',
    payload: {
      payment: {
        entity: {
          id: 'pay_auth123456789',
          amount: 250000,
          currency: 'INR',
          status: 'authorized',
          order_id: 'order_test123456789',
          method: 'card',
          captured: false,
          description: 'Train booking payment',
          email: 'test@example.com',
          contact: '+919876543210',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  orderPaid: {
    event: 'order.paid',
    payload: {
      order: {
        entity: {
          id: 'order_test123456789',
          amount: 250000,
          amount_paid: 250000,
          amount_due: 0,
          currency: 'INR',
          receipt: 'booking_receipt_123',
          status: 'paid',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  refundCreated: {
    event: 'refund.created',
    payload: {
      refund: {
        entity: {
          id: 'rfnd_test123456789',
          amount: 250000,
          currency: 'INR',
          payment_id: 'pay_test123456789',
          notes: {
            reason: 'Booking cancelled by user'
          },
          receipt: null,
          status: 'processed',
          created_at: Math.floor(Date.now() / 1000),
          batch_id: null,
          speed_processed: 'normal'
        }
      }
    }
  },

  refundProcessed: {
    event: 'refund.processed',
    payload: {
      refund: {
        entity: {
          id: 'rfnd_test123456789',
          amount: 250000,
          currency: 'INR',
          payment_id: 'pay_test123456789',
          status: 'processed',
          speed_processed: 'normal',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  }
};

// Generate webhook signature for testing
function generateWebhookSignature(body, secret) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

async function testWebhook(eventType = 'paymentCaptured', url = 'http://localhost:3000') {
  const event = testEvents[eventType];
  
  if (!event) {
    console.log('❌ Available events:', Object.keys(testEvents).join(', '));
    return;
  }

  console.log(`🧪 Testing: ${event.event}`);
  console.log(`📤 URL: ${url}/api/payment/webhook`);
  
  try {
    const body = JSON.stringify(event);
    const webhookSecret = '12345678'; // Updated to match user's actual webhook secret
    const signature = generateWebhookSignature(body, webhookSecret);
    
    console.log(`🔐 Generated signature: ${signature}`);
    
    const response = await fetch(`${url}/api/payment/webhook`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Razorpay-Signature': signature
      },
      body: body
    });

    const result = await response.text();
    console.log(`📥 Status: ${response.status}`);
    console.log(`📥 Response: ${result}`);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Usage: node test-razorpay-webhook.js [eventType] [url]
const eventType = process.argv[2] || 'paymentCaptured';
const url = process.argv[3] || 'http://localhost:3000';

console.log('🎯 Authentic Razorpay Webhook Tester');
console.log('====================================');
console.log('Available events:');
console.log('- paymentCaptured');
console.log('- paymentFailed');
console.log('- paymentAuthorized');
console.log('- orderPaid');
console.log('- refundCreated');
console.log('- refundProcessed');
console.log('====================================');

testWebhook(eventType, url); 