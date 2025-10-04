const router = require('express').Router();
const { PrismaClient } = require('@prisma/client'); // Adjust the path as necessary
const prisma = new PrismaClient();
const sendEmail = require('../utils/mailer'); // hypothetical email service

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

        //also send credentials to user's email
       await sendEmail(email, 'Welcome to Expense Management System', `Hello ${name},\n\nYour account has been created for ${companyId}. \nYour credentials are as follows:\n\nEmail: ${email}\nPassword: ${password || 'defaultPassword'}\n\nBest regards,\nExpense Management Team`);
        res.status(201).json({ user: createdUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ---------------- Get all users for a company ----------------
router.get('/users/:companyId', async (req, res) => {
    const companyId = parseInt(req.params.companyId);

    if (isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid company ID" });
    }

    try {
        const users = await prisma.user.findMany({
            where: { companyId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_approver: true,
                created_at: true,
                updated_at: true
            }
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;