const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Loan = require('../models/loans.model');

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Missing MONGO_URI');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    const loans = await Loan.find({}, {
      _id: 1,
      membershipId: 1,
      amountRequested: 1,
      purpose: 1,
      repaymentPeriod: 1,
      status: 1,
      applicationDate: 1
    }).lean();
    console.table(loans);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();