const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  term: {
    type: Number,
    required: true,
    min: 1
  },
  interestRate: {
    type: Number,
    default: 5,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'repaid'],
    default: 'pending'
  },
  monthlyPayment: {
    type: Number
  },
  totalRepayment: {
    type: Number
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  disbursedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate monthly payment and total repayment before saving
loanSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount') || this.isModified('term') || this.isModified('interestRate')) {
    const principal = this.amount;
    const monthlyRate = this.interestRate / 100 / 12;
    const numPayments = this.term;
    
    if (monthlyRate === 0) {
      this.monthlyPayment = principal / numPayments;
    } else {
      this.monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                           (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    this.totalRepayment = this.monthlyPayment * numPayments;
  }
  next();
});

// Check if model exists before creating it
module.exports = mongoose.models.Loan || mongoose.model('Loan', loanSchema);