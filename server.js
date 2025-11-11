// fego-coop-backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  'https://fego02multipurposecoop.com',
  'https://www.fego02multipurposecoop.com'
];

const app = express();
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Use MONGODB_URI (not MONGO_URI)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const userRouter = require('./routes/user-auth.routes');
const loanRouter = require('./routes/loans.routes');
const paystackRouter = require('./routes/paystack.routes');
const projectRouter = require('./routes/projects.routes');
const adminRouter = require('./routes/admin.routes');

console.log('userRouter type:', typeof userRouter);
console.log('loanRouter type:', typeof loanRouter);
console.log('paystackRouter type:', typeof paystackRouter);
console.log('projectRouter type:', typeof projectRouter);
console.log('adminRouter type:', typeof adminRouter);

app.use('/api/users', userRouter);
app.use('/api/loans', loanRouter);
app.use('/api/paystack', paystackRouter);
app.use('/api/projects', projectRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => res.json({ ok: true }));
