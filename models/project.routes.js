// fego-coop-backend/routes/project.routes.js
const router = require('express').Router();
let Project = require('../models/project.model');
let User = require('../models/user.model');
const auth = require('../middleware/auth.middleware');

// @route   GET /api/projects
// @desc    Get all active investment projects
// @access  Private (only for members)
router.route('/').get(auth, async (req, res) => {
    try {
        const projects = await Project.find({ status: 'Open' });
        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error fetching projects.');
    }
});

// @route   POST /api/projects/invest
// @desc    Allow a member to invest in a project
// @access  Private (only for authenticated members)
router.route('/invest').post(auth, async (req, res) => {
    const userId = req.user.id;
    const { projectId, amount } = req.body;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Optional: Add logic to ensure user has enough funds, etc. (more complex logic for later)
        // For now, we assume funds are available and deduct them from total contributions.
        if (user.totalContributions < amount) {
             return res.status(400).json({ msg: 'Insufficient funds for investment.' });
        }

        // 1. Update the user's investment portfolio
        const newInvestment = { projectId: project._id, amount: amount, date: new Date() };
        user.investmentsInProjects.push(newInvestment);
        user.totalContributions -= amount; // Deduct from contributions
        await user.save();

        // 2. Update the project's current raised amount
        project.currentRaised += amount;
        // Check if project is fully funded
        if (project.currentRaised >= project.targetAmount) {
            project.status = 'Funded';
        }
        await project.save();

        res.json({ msg: 'Investment successful!', user, project });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during investment.');
    }
});

module.exports = router;
