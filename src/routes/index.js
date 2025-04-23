const express = require('express');
const router = express.Router();
const controller = require('../controllers/index');

// Define a simple route
router.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to WebMatica' });
});

// Export the router
module.exports = router;