// fego-coop-backend/models/project.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentRaised: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Open', 'Funded', 'Completed', 'Canceled'], 
        default: 'Open' 
    },
}, {
    timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
