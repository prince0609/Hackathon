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

        //create admin entry in user table
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: adminName,
                companyId: company.id,
                role: 'ADMIN',
                is_approver: true,
                password: adminPassword || 'defaultPassword', // In real app, hash the password and don't use default
            },
        });

        res.status(201).json({ company, adminUser });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Get All Users in a Company
router.get('/admin/users/:companyId', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { companyId: parseInt(req.params.companyId) }
        });
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


// Get All Flows for a Company
router.get('/admin/flows/:companyId', async (req, res) => {
    try {
        const flows = await prisma.approvalFlow.findMany({
            where: {
                user: {
                    companyId: parseInt(req.params.companyId)
                }
            },
            include: { steps: true, approvals: true }
        });
        res.status(200).json({ flows });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get All Expenses for a Company
router.get('/admin/expenses/:companyId', async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { companyId: parseInt(req.params.companyId) },
            include: { employee: true }
        });
        res.status(200).json({ expenses });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;