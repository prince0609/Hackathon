const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const roleRoutes = require('./routes/role');
const addExpenseRoutes = require('./routes/expense');
const flowRoutes = require('./routes/flow');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');


const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Serve static files from uploads directory

// API Routes
app.use('/api', authRoutes);
app.use('/api', roleRoutes);
app.use('/api', addExpenseRoutes);
app.use('/api', flowRoutes);
app.use('/api', require('./routes/adminRoutes')); // Admin routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
