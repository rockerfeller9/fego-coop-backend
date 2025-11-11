const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, trim: true },
  membershipId: { type: String, required: true, unique: true, trim: true },
  totalContributions: { type: Number, default: 0 },
  currentLoanBalance: { type: Number, default: 0 },
  investmentsInProjects: [{
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }],
  isAdmin: { type: Boolean, default: false },
  isSynced: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);