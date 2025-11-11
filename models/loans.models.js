// fego-coop-backend/models/loan.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loanSchema = new Schema({
    // Link this application back to a specific user/member ID
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', // Refers to the 'User' model we already have
        required: true 
    },
    membershipId: { type: String, required: true },

    // Loan details provided by the member
    amountRequested: { type: Number, required: true, min: 100 },
    purpose: { type: String, required: true, trim: true },
    repaymentPeriod: { type: Number, required: true }, // in months

    // Admin/System tracking fields
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Paid'], 
        default: 'Pending' 
    },
    applicationDate: { type: Date, default: Date.now },
    approvedDate: { type: Date },
    adminNotes: { type: String }

}, {
    timestamps: true,
});

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;
