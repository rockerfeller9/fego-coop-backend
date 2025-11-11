// fego-coop-backend/models/loan.model.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const loanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ADD
  membershipId: { type: String, required: true },
  amountRequested: { type: Number, required: true },
  purpose: { type: String, required: true },
  repaymentPeriod: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminNotes: { type: String },
  approvedDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Loan || mongoose.model('Loan', loanSchema);
