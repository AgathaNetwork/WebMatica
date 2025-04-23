// This file exports functions that handle the logic for each route.
// It processes incoming requests and sends responses.

exports.getHome = (req, res) => {
    res.render('index', { title: 'Home' });
};

// Add more controller functions as needed for other routes.