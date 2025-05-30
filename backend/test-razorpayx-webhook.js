#!/usr/bin/env node

import fetch from 'node-fetch';

// Simple test script for RazorpayX webhook events
const testEvents = {
  fundAccountValidation: {
    event: 'fund_account.validation.completed',
    payload: {
      fund_account: {
        entity: {
          id: 'fa_test123',
          account_type: 'bank_account',
          bank_account: {
            name: 'Test Account',
            account_number: '1234567890'
          },
          active: true
        }
      }
    }
  },

  transactionCreated: {
    event: 'transaction.created',
    payload: {
      transaction: {
        entity: {
          id: 'txn_test123456',
          amount: 250000, // ₹2500 in paisa
          currency: 'INR',
          status: 'created',
          type: 'payment',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  payoutProcessed: {
    event: 'payout.processed',
    payload: {
      payout: {
        entity: {
          id: 'pout_success123',
          amount: 250000,
          currency: 'INR',
          status: 'processed',
          reference_id: 'txn_test123456',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  },

  payoutRejected: {
    event: 'payout.rejected',
    payload: {
      payout: {
        entity: {
          id: 'pout_failed123',
          amount: 250000,
          currency: 'INR',
          status: 'rejected',
          reference_id: 'txn_test123456',
          failure_reason: 'Insufficient balance',
          created_at: Math.floor(Date.now() / 1000)
        }
      }
    }
  }
};

async function testWebhook(eventType = 'transactionCreated', url = 'http://localhost:3000') {
  const event = testEvents[eventType];
  
  if (!event) {
    console.log('❌ Available events:', Object.keys(testEvents).join(', '));
    return;
  }

  console.log(`🧪 Testing: ${event.event}`);
  console.log(`📤 URL: ${url}/api/payment/webhook`);
  
  try {
    const response = await fetch(`${url}/api/payment/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    const result = await response.text();
    console.log(`📥 Status: ${response.status}`);
    console.log(`📥 Response: ${result}`);
    
    if (response.ok) {
      console.log('✅ Test successful!');
    } else {
      console.log('❌ Test failed!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Usage: node test-razorpayx-webhook.js [eventType] [url]
const eventType = process.argv[2] || 'transactionCreated';
const url = process.argv[3] || 'http://localhost:3000';

console.log('🎯 RazorpayX Webhook Tester');
console.log('==========================');
testWebhook(eventType, url); 