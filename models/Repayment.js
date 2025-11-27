import mongoose from 'mongoose';

const repaymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  loan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Loan' 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 100 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  reference: { 
    type: String, 
    unique: true, 
    required: true 
  },
  paymentMethod: { 
    type: String, 
    default: 'paystack' 
  }
}, { timestamps: true });

export default mongoose.model('Repayment', repaymentSchema);