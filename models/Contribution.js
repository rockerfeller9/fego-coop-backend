import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['monthly', 'voluntary'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  reference: { type: String, unique: true },
  paymentMethod: { type: String, default: 'paystack' }
}, { timestamps: true });

export default mongoose.model('Contribution', contributionSchema);