const express = require('express');
const path = require('path');
const routes = require('./routes/index');
const statusRoute = require('./routes/status');
const regionRoute = require('./routes/region');
const exportApiRoute = require('./routes/exportapi');
const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // 暴露 uploads 文件夹

// 新增路由文件引入

// Routes
app.use('/', routes);
app.use('/', statusRoute);
app.use('/', regionRoute);
app.use('/', exportApiRoute); // 新增路由

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});