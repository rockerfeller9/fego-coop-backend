import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  amount: { type: Number, required: true },
  expectedReturn: { type: Number },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  duration: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Investment', investmentSchema);