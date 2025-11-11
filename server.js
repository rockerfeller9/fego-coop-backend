// fego-coop-backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Middlewares in correct order
app.use(cors());

// Webhook must come BEFORE express.json so we can read raw body
app.use('/api/paystack/webhook', require('./routes/paystack.webhook.routes'));

app.use(express.json());

// Routes - declare each router ONCE
const userRouter = require('./routes/user-auth.routes');
const loanRouter = require('./routes/loans.routes');
const paystackRouter = require('./routes/paystack.routes');
const projectRouter = require('./routes/project.routes');
const adminRouter = require('./routes/admin.routes');

console.log('userRouter type:', typeof userRouter);
console.log('loanRouter type:', typeof loanRouter);
console.log('paystackRouter type:', typeof paystackRouter);
console.log('projectRouter type:', typeof projectRouter);
console.log('adminRouter type:', typeof adminRouter);

if (typeof projectRouter !== 'function') {
  console.error('projectRouter is not a router. Check routes/project.routes.js');
  process.exit(1);
}

// Mount routers
app.use('/api/users', userRouter);
app.use('/api/loans', loanRouter);
app.use('/api/paystack', paystackRouter);
app.use('/api/projects', projectRouter);
app.use('/api/admin', adminRouter);

// Connect to MongoDB
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('MONGO_URI not found in .env');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
