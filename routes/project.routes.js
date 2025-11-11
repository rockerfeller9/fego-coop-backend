const router = require('express').Router();
const Project = require('../models/project.model');
const User = require('../models/user.model');
const auth = require('../middleware/auth.middleware');

// @route   GET /api/projects
// @desc    Get all active investment projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ status: 'Open' });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error fetching projects' });
  }
});

// @route   POST /api/projects/invest
// @desc    Invest in a project
// @access  Private
router.post('/invest', auth, async (req, res) => {
  const { projectId, amount } = req.body;
  const userId = req.user.id;

  try {
    if (!projectId || !amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid project or amount' });
    }

    const project = await Project.findById(projectId);
    if (!project || project.status !== 'Open') {
      return res.status(404).json({ msg: 'Project not found or not open' });
    }

    // Update project
    project.currentRaised += amount;
    if (project.currentRaised >= project.targetAmount) {
      project.status = 'Funded';
    }
    await project.save();

    // Update user
    await User.findByIdAndUpdate(userId, {
      $push: {
        investmentsInProjects: {
          projectId,
          amount,
          date: new Date()
        }
      }
    });

    res.json({ msg: 'Investment recorded successfully', project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error processing investment' });
  }
});

module.exports = router;