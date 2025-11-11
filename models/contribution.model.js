const mongoose = require('mongoose');
const { Schema } = mongoose;

const contributionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membershipId: { type: String, required: true },
  amount: { type: Number, required: true },
  transactionRef: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.models.Contribution || mongoose.model('Contribution', contributionSchema);