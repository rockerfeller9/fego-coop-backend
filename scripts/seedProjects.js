const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const Project = require('../models/project.model');

const projects = [
  {
    name: "Community Farm Expansion",
    description: "Expand our local farm with new equipment and land to increase food production for members.",
    targetAmount: 2000000,
    currentRaised: 0,
    status: "Open",
    startDate: new Date("2025-11-08"),
    endDate: new Date("2026-12-31"),
    expectedReturns: "20% ROI over 12 months"
  },
  {
    name: "Poultry Farm Initiative",
    description: "Establish a modern poultry farm to supply fresh eggs and chicken to cooperative members and generate additional revenue.",
    targetAmount: 1500000,
    currentRaised: 0,
    status: "Open",
    startDate: new Date("2025-11-08"),
    endDate: new Date("2026-06-30"),
    expectedReturns: "15% ROI over 6 months"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Project.insertMany(projects);
    console.log('✅ Projects seeded successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });