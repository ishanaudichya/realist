const express = require('express');
const { community, profile, navbar, sidebar } = require('../controllers/mainController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth for all page routes
router.use(requireAuth);

// community tab
router.get('/community', community);

// profile page
router.get('/profile/:username', profile);

// navbar profile icon
router.get('/navbar/:username', navbar);

// sidebar info
router.get('/sidebar/:username', sidebar);

module.exports = router;
