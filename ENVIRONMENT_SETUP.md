# BookXpress Environment Setup Guide

## 🔧 Backend Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

### Database Configuration
```env
MONGODB_URI=mongodb://localhost:27017/bookxpress
DB_NAME=bookxpress
```

### JWT Configuration
```env
JWT_SECRET=your-secret-key
```

### API Keys - RapidAPI (Updated Working Keys)
```env
RAPIDAPI_KEY=d15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196
PNR_API_KEY=d15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196
```

### Razorpay Configuration
```env
RAZORPAY_KEY_ID=rzp_test_hwRfIuKJQudGqL
RAZORPAY_KEY_SECRET=n3kpcHbWeiCBhZX9Wy4Rl1B5
RAZORPAY_WEBHOOK_SECRET=12345678
```

### Server Configuration
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Rate Limiting
```env
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Production Environment (Render)

For the deployed backend on Render, ensure these environment variables are set:

### Required Environment Variables on Render:
1. **MONGODB_URI** - Your MongoDB connection string
2. **JWT_SECRET** - Your JWT secret key
3. **RAPIDAPI_KEY** - `d15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196`
4. **PNR_API_KEY** - `d15f05b26amshc2c90427a2f6385p119c29jsn71e9babc3196`
5. **RAZORPAY_KEY_ID** - `rzp_test_hwRfIuKJQudGqL`
6. **RAZORPAY_KEY_SECRET** - `n3kpcHbWeiCBhZX9Wy4Rl1B5`
7. **RAZORPAY_WEBHOOK_SECRET** - `12345678`
8. **NODE_ENV** - `production`
9. **PORT** - `3000` (or let Render auto-assign)

## 📱 Frontend Environment (Optional)

If using environment variables in frontend, create `.env` in `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=rzp_test_hwRfIuKJQudGqL
```

For production frontend (Netlify):
```env
VITE_API_URL=https://bookxpress.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_hwRfIuKJQudGqL
```

## 🔐 Security Notes

1. **Never commit `.env` files** to version control
2. **Rotate API keys** periodically
3. **Use different keys** for production vs development
4. **Keep webhook secrets secure**
5. **Use strong JWT secrets**

## 🧪 Testing Configuration

### Webhook Testing
- **Webhook URL**: `https://bookxpress.onrender.com/api/payment/webhook`
- **Webhook Secret**: `12345678`
- **Events**: All 6 Razorpay events configured

### API Testing
- **Backend**: `https://bookxpress.onrender.com`
- **Local Backend**: `http://localhost:3000`
- **Local Frontend**: `http://localhost:5173`

## ✅ Verification Steps

1. Check backend health: `GET /api/health`
2. Test webhook: Use the test script in `backend/test-razorpay-webhook.js`
3. Verify API keys: Test train search and PNR check endpoints
4. Test payment flow: Create order and verify payment processing

---
**Last Updated**: December 2024
**Status**: All systems operational ✅ 