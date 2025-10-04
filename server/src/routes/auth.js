const router = require('express').Router();
const { PrismaClient } = require('@prisma/client'); // Adjust the path as necessary
const prisma = new PrismaClient();

// sign up route for company and admin user
router.post('/signup', async (req, res) => {
    const { companyName, country, adminEmail, adminName, adminPassword } = req.body;

    try {
        // Create company
        const company = await prisma.company.create({
            data: {
                name: companyName,
                country: country,
                currency: 'USD', // default currency
            },
        });

        // Create admin user
        const adminUser = await prisma.admin.create({
            data: {
                email: adminEmail,
                name: adminName,
                companyId: company.id,
                password: adminPassword || 'defaultPassword', // In real app, hash the password and don't use default
            },
        });

        res.status(201).json({ company, adminUser });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        
        if(role === 'EMPLOYEE'){
            const user = await prisma.user.findUnique({
                where: { email: email },
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            if (user.password !== password) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            return res.status(200).json({ message: 'Login successful', user });
        }

        const adminUser = await prisma.admin.findUnique({
            where: { email: email },
        });

        if (!adminUser) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // In a real app, you would compare the hashed password
        if (adminUser.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({ message: 'Login successful', adminUser });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;