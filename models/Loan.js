import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'paid'], default: 'pending' },
  purpose: { type: String, required: true },
  monthlyPayment: { type: Number },
  totalRepayment: { type: Number },
  amountPaid: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Loan', loanSchema);