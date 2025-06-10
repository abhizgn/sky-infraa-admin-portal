import { Router } from 'express';
import { CommonExpense } from '../models/CommonExpense';
import { Flat } from '../models/Flat';
import { Bill } from '../models/Bills';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';
import { format } from 'date-fns'; // Import date-fns for month/year extraction

const router = Router();

// Get all common expenses (filtered by apartmentId if provided)
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { apartmentId } = req.query; // Get apartmentId from query parameters
    let query: any = {};

    if (apartmentId && apartmentId !== 'all') { // If apartmentId is provided and not 'all'
      query.apartmentId = apartmentId;
    }

    const allExpenses = await CommonExpense.find(query)
      .populate('apartmentId', 'name') // Crucial: Populate the apartmentId to get its name
      .sort({ createdAt: -1 });

    res.json(allExpenses);
  } catch (error) {
    console.error('Error fetching common expenses:', error);
    res.status(500).json({ message: 'Error fetching common expenses' });
  }
});

// Upload and distribute a new common expense
router.post('/distribute', verifyToken, adminOnly, async (req, res) => { // Changed route to /distribute as per frontend
  try {
    const { apartmentId, name, description, amount, date, distributionType } = req.body;

    if (!apartmentId || amount <= 0 || !name || !date || !distributionType) {
      return res.status(400).json({ message: 'Missing required expense details (apartmentId, name, amount, date, distributionType).' });
    }

    const expenseDate = new Date(date);
    const month = format(expenseDate, 'MMMM'); // e.g., "June"
    const year = expenseDate.getFullYear();

    // Find all occupied flats for the specific apartment
    const flats = await Flat.find({ apartmentId, isOccupied: true }).populate('ownerId');

    if (flats.length === 0) {
      return res.status(400).json({ message: 'No occupied flats found for this apartment to distribute expense to.' });
    }

    let billAmountPerFlat: number = 0;
    let totalArea: number = 0;
    let perSqFtAmount: number = 0;

    switch (distributionType) {
      case 'per_flat':
        billAmountPerFlat = amount / flats.length;
        break;
      case 'per_sqft':
        totalArea = flats.reduce((sum, flat) => sum + (flat.areaSqft || 0), 0);
        if (totalArea === 0) {
          return res.status(400).json({ message: 'Flats have zero total area for per_sqft distribution.' });
        }
        perSqFtAmount = amount / totalArea;
        break;
      case 'fixed':
        // For fixed, it's a single common expense, no per-flat bill generation here
        // The frontend common expense list would show this.
        // If bills are still desired for 'fixed', logic would be similar to below, but amount would be total.
        // For now, I'll assume 'fixed' means it's tracked as a lump sum and doesn't generate per-flat bills.
        // If you need fixed to generate a single bill for a default flat, let me know.
        // If 'fixed' means it's *not* distributed, then the following bill creation should be skipped.
        // Given the context, 'distribute' implies per-flat billing for per_flat/per_sqft.
        break;
      default:
        return res.status(400).json({ message: 'Invalid distribution type.' });
    }

    // Create a CommonExpense record
    const commonExpense = await CommonExpense.create({
      apartmentId,
      month,
      year,
      title: name,
      description,
      totalAmount: amount,
      date: expenseDate,
      distributionType,
    });

    // Generate bills for each flat based on distribution type (if not 'fixed')
    if (distributionType === 'per_flat' || distributionType === 'per_sqft') {
      for (const flat of flats) {
        if (!flat.ownerId) {
          console.warn(`Flat ${flat.flatNumber} in apartment ${apartmentId} is occupied but has no owner. Skipping bill generation.`);
          continue;
        }

        const billAmount = distributionType === 'per_flat'
          ? billAmountPerFlat
          : (flat.areaSqft || 0) * perSqFtAmount;

        // Ensure bill amount is positive and reasonable
        if (billAmount <= 0) {
          console.warn(`Calculated bill amount for flat ${flat.flatNumber} is zero or negative. Skipping bill generation.`);
          continue;
        }

        const dueDate = new Date(expenseDate);
        dueDate.setMonth(dueDate.getMonth() + 1); // Due next month

        // Find existing bill for the month or create a new one
        let bill = await Bill.findOne({
          flatId: flat._id,
          month,
          year,
          ownerId: flat.ownerId // Ensure it matches the owner
        });

        if (bill) {
          bill.amount += billAmount; // Add to existing bill
        } else {
          bill = new Bill({
            flatId: flat._id,
            ownerId: flat.ownerId,
            month,
            year,
            amount: billAmount,
            status: 'Unpaid',
            generatedDate: new Date(),
            dueDate: dueDate,
          });
        }
        await bill.save();
      }
    }

    res.status(201).json({ message: 'Expense distributed successfully', commonExpense });
  } catch (error: any) {
    console.error('Error distributing common expense:', error);
    // Handle duplicate key error specifically for common expense if title+month+year+apartmentId needs to be unique
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A common expense with this title for the selected apartment and month/year already exists.'
      });
    }
    res.status(500).json({
      message: 'Failed to distribute expense',
      error: error.message
    });
  }
});

export default router;
