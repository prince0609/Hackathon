const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/approve', async (req, res) => {
    const { approverId, approvalId, status, comment } = req.body;
    try {
        // 1. Update current approval
        const approval = await prisma.expenseApproval.update({
            where: { id: parseInt(approvalId) },
            data: { status, comment }
        });

        const expense = await prisma.expense.findUnique({
            where: { id: approval.expenseId },
            include: { approvals: true }
        });

        const flow = await prisma.approvalFlow.findFirst({
            where: { companyId: expense.companyId, is_active: true },
            include: { steps: { orderBy: { step_order: 'asc' } }, approvals: true }
        });

        // 2. Conditional approval logic
        let isApproved = false;
        for(const rule of flow.approvals){
            if(rule.rule_type === 'PERCENTAGE'){
                const approvedCount = expense.approvals.filter(a => a.status === 'APPROVED').length;
                const totalApprovers = expense.approvals.length;
                const thresholdCount = Math.ceil(totalApprovers * (rule.threshold_percentage / 100));
                if(approvedCount >= thresholdCount) isApproved = true;
            }
            if(rule.rule_type === 'SPECIFIC' && rule.specificApproverId){
                const specificApproval = expense.approvals.find(a => a.approverId === rule.specificApproverId && a.status === 'APPROVED');
                if(specificApproval) isApproved = true;
            }
            if(rule.rule_type === 'HYBRID' && rule.specificApproverId){
                const approvedCount = expense.approvals.filter(a => a.status === 'APPROVED').length;
                const totalApprovers = expense.approvals.length;
                const thresholdCount = Math.ceil(totalApprovers * (rule.threshold_percentage / 100));
                const specificApproval = expense.approvals.find(a => a.approverId === rule.specificApproverId && a.status === 'APPROVED');
                if(approvedCount >= thresholdCount || specificApproval) isApproved = true;
            }
        }

        // 3. Update expense status if conditional rule passed
        if(isApproved){
            await prisma.expense.update({ where: { id: expense.id }, data: { status: 'APPROVED' } });
        } else if(status === 'REJECTED'){
            await prisma.expense.update({ where: { id: expense.id }, data: { status: 'REJECTED' } });
        } else {
            // Move to next step
            const nextStep = flow.steps.find(s => s.step_order === approval.step_order + 1);
            if(nextStep){
                await prisma.expenseApproval.create({
                    data: {
                        expenseId: expense.id,
                        approverId: nextStep.approverId,
                        step_order: nextStep.step_order,
                        status: 'PENDING'
                    }
                });
                await prisma.expense.update({ where: { id: expense.id }, data: { status: 'IN_PROGRESS' } });
            }
        }

        res.status(200).json({ message: 'Approval processed', expense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
