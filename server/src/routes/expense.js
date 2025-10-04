const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const multer = require('multer');
const Tesseract = require('tesseract.js');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await Tesseract.recognize(req.file.path, 'eng');
    const text = result.data.text;

    const amountMatch = text.match(/[\d,.]+/);
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);

    const extractedData = {
      amount: amountMatch ? parseFloat(amountMatch[0].replace(',', '')) : null,
      currency: "USD",
      date: dateMatch ? new Date(dateMatch[0]) : new Date(),
      category: 'General',
      description: text.substring(0, 50),
      file_name: req.file.filename
    };

    res.status(200).json({ extractedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OCR failed' });
  }
});

// Add Expense
router.post('/expense-add', async (req, res) => {
  const { employeeId, companyId, amount, category, description, date, is_receipt, file_name } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: employeeId } });
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!user || !company) return res.status(400).json({ error: 'Invalid user or company' });

    const expense = await prisma.expense.create({
      data: {
        employeeId: parseInt(employeeId),
        companyId: parseInt(companyId),
        amount: parseFloat(amount),
        currency: company.currency,
        category,
        description,
        date: new Date(date),
        status: "PENDING",
        is_receipt: !!is_receipt,
        file_name
      }
    });

    const flow = await prisma.approvalFlow.findFirst({
      where: { companyId, is_active: true },
      include: { steps: { orderBy: { step_order: 'asc' } } }
    });

    if (flow && flow.steps.length > 0) {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get history
router.get('/history/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const expenses = await prisma.expense.findMany({
      where: { employeeId: userId },
      include: { approvals: { include: { approver: true } } },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pending approvals
router.get('/pending/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const pending = await prisma.expenseApproval.findMany({
      where: { approverId: userId, status: 'PENDING' },
      include: { expense: true },
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ pending });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
