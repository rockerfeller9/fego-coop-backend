import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  membershipId: { type: String, required: true, unique: true, index: true },
  isSynced: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  totalContributions: { type: Number, default: 0 },
  currentLoanBalance: { type: Number, default: 0 },
  investmentsInProjects: [{ type: String }],
  notifications: [NotificationSchema]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);