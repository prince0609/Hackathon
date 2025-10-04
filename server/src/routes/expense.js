const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');

const multer = require('multer');
const Tesseract = require('tesseract.js'); // OCR engine

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const imagePath = req.file.path;

        // Run OCR on the uploaded image
        const result = await Tesseract.recognize(imagePath, 'eng');
        const text = result.data.text;

        // Example parsing (improve with your own regex or NLP)
        const amountMatch = text.match(/[\d,.]+/);
        const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);

        const extractedData = {
            amount: amountMatch ? parseFloat(amountMatch[0].replace(',', '')) : null,
            currency: "USD", // Default, improve with actual detection
            date: dateMatch ? new Date(dateMatch[0]) : new Date(),
            category: 'General',
            description: text.substring(0, 50),
            file_name: req.file.filename
        };

        res.status(200).json({ extractedData });
    } catch (error) {
        console.error('OCR error:', error);
        res.status(500).json({ error: 'OCR failed' });
    }
});


// ---------------- Add Expense ----------------
router.post('/expense-add', async (req, res) => {
    const {
        employeeId,        // employee user id
        companyId,        // company id
        amount,
        category,
        description,
        date,
        is_receipt,
        file_name
    } = req.body;

    try {
        // validate user + company exist (optional safety check)
        const user = await prisma.user.findUnique({ where: { id: employeeId } });
        const company = await prisma.company.findUnique({ where: { id: companyId } });

        if (!user || !company) {
            return res.status(400).json({ error: 'Invalid user or company ID' });
        }

        // create expense
        const expense = await prisma.expense.create({
            data: {
                employeeId : parseInt(employeeId),
                companyId: parseInt(companyId),
                amount: parseFloat(amount),
                currency: company.currency,
                category : category,
                description: description,
                date: new Date(date),
                status: "PENDING",
                is_receipt: is_receipt ?? false,
                file_name: file_name
            }
        });

         // Assign first approval step
        const flow = await prisma.approvalFlow.findFirst({
            where: { companyId, is_active: true },
            include: { steps: { orderBy: { step_order: 'asc' } }, approvals: true }
        });

        if(flow && flow.steps.length > 0){
            await prisma.expenseApproval.create({
                data: {
                    expenseId: expense.id,
                    approverId: flow.steps[0].approverId,
                    step_order: flow.steps[0].step_order,
                    status: 'PENDING'
                }
            });
        }

        res.status(201).json({ message: 'Expense created successfully', expense });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Get expense history for a employee
router.get('/history/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const expenses = await prisma.expense.findMany({
            where: { employeeId: userId },
            include: { approvals: { include: { approver: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ expenses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get pending approvals for approver manager, cfo, etc.
router.get('/pending/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const pending = await prisma.expenseApproval.findMany({
            where: { approverId: userId, status: 'PENDING' },
            include: { expense: true },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ pending });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

