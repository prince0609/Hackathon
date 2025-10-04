const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create Approval Flow
router.post('/create-flow', async (req, res) => {
    const { userId, name, description, steps, rules } = req.body;
    // steps = [{ approverId, step_order }]
    // rules = [{ rule_type, threshold_percentage }]
    try {
        const flow = await prisma.approvalFlow.create({
            data: {
                userId: parseInt(userId),   
                name,
                description,
                steps: {
                    create: steps.map(s => ({
                        approverId: s.approverId,
                        step_order: s.step_order
                    }))
                },
                approvals: {
                    create: rules.map(r => ({
                        rule_type: r.rule_type,
                        threshold_percentage: r.threshold_percentage || null
                    }))
                }
            },
            include: { steps: true, approvals: true }
        });

        res.status(201).json({ message: 'Approval flow created', flow });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all flows for a user
router.get('/flows/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);  
    try {
        const flows = await prisma.approvalFlow.findMany({
            where: { userId },
            include: { steps: true, approvals: true }
        });
        res.status(200).json({ flows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
