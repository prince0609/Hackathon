const router = require('express').Router();
const { PrismaClient } = require('@prisma/client'); // Adjust the path as necessary
const prisma = new PrismaClient();

// Route to create user with role
router.post('/create-user', async (req, res) => {
    const { companyId, role, name, email, is_approver, password } = req.body; // roles is an array of role names

    try {
        const createdUser = await prisma.user.create({
            data: {
                    companyId: parseInt(companyId),
                    role: role,
                    name: name,
                    email: email,
                    password: password || 'defaultPassword', // In real app, hash the password and don't use default
                    is_approver: is_approver
            }
        });

        res.status(201).json({ user: createdUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;