import { Router, Request, Response } from 'express';
import { Owner } from '../models/Owner';
import { Bill } from '../models/Bills';
import { verifyToken } from '../middleware/authMiddleware';
import { format } from 'date-fns';
import { ObjectId } from 'mongoose';
import { Arrear } from '../models/Arrear';
import { Flat } from '../models/Flat';
import { IBill, IBillPopulatedLean } from '../types';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Define the custom request type that includes the user property
// This interface is crucial for TypeScript to understand req.user
interface AuthRequest extends Request {
  user?: {
    id: string | ObjectId; // Use ObjectId or string for consistency
    role: 'admin' | 'owner';
    name: string;
    flat_no?: string;
  };
}

const router = Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: "rzp_test_YOUR_DUMMY_KEY_ID", // TEMPORARY DEBUG ONLY!
  key_secret: "YOUR_DUMMY_KEY_SECRET",  // TEMPORARY DEBUG ONLY!
});

// Get owner dashboard data
router.get('/dashboard', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    // Ensure req.user is available due to verifyToken middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Owner ID not found in token.' });
    }

    // Get owner data with populated flat and apartment info
    // Cast req.user.id to ObjectId to ensure correct type for findById
    const owner = await Owner.findById(req.user.id as ObjectId)
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId',
        populate: {
          path: 'apartmentId',
          select: 'name'
        }
      })
      .lean();

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    // Get recent bills (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    threeMonthsAgo.setHours(0, 0, 0, 0); // Normalize to start of day

    const recentBills = await Bill.find({
      ownerId: owner._id,
      generatedDate: { $gte: threeMonthsAgo }
    })
    .sort({ generatedDate: -1 })
    .limit(3)
    .lean() as unknown as IBillPopulatedLean[];

    // Calculate current due (sum of unpaid bills)
    const currentDue = await Bill.aggregate([
      {
        $match: {
          ownerId: owner._id, // Ensure owner._id is used
          status: 'Unpaid'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get monthly payment history (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0); // Normalize to start of day

    const monthlyPayments = await Bill.aggregate([
      {
        $match: {
          ownerId: owner._id, // Ensure owner._id is used
          generatedDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$generatedDate' },
            month: { $month: '$generatedDate' }
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get expense breakdown for current month
    const currentMonth = new Date();
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const nextMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const expenseBreakdown = await Bill.aggregate([
      {
        $match: {
          ownerId: owner._id,
          generatedDate: {
            $gte: currentMonthStart,
            $lt: nextMonthStart
          }
        }
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      }
    ]);

    // Format the response
    const response = {
      ...owner,
      currentDue: currentDue[0]?.total || 0,
      recentBills: recentBills.map(bill => ({
        month: format(new Date(bill.year, bill.month - 1), 'MMMM yyyy'),
        amount: bill.amount,
        status: bill.status,
        dueDate: bill.dueDate,
        receiptId: bill.receiptId || null
      })),
      monthlyPayments: monthlyPayments.map(payment => ({
        month: format(new Date(payment._id.year, payment._id.month - 1), 'MMM'),
        amount: payment.amount
      })),
      expenseBreakdown: expenseBreakdown.map(expense => ({
        name: expense._id,
        value: expense.value,
        color: getExpenseColor(expense._id)
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching owner dashboard data:', error);
    res.status(500).json({
      message: 'Error fetching dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get owner's arrears
router.get('/arrears', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Owner ID not found in token.' });
    }

    const arrears = await Arrear.find({ ownerId: req.user.id, status: 'pending' })
      .lean(); // Use .lean() for plain JavaScript objects

    res.json(arrears);
  } catch (error) {
    console.error('Error fetching owner arrears:', error);
    res.status(500).json({
      message: 'Error fetching arrears',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /owner/bills - Get all bills for the authenticated owner (Corrected and dedicated route)
router.get('/bills', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Owner ID not found in token.' });
    }

    const ownerId = req.user.id as ObjectId;

    // Fetch all bills for the owner, populating flat details
    const bills = await Bill.find({ ownerId })
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId type areaSqft maintenanceCharge',
        populate: {
          path: 'apartmentId',
          select: 'name address',
        },
      })
      .populate('ownerId', 'name email') // Populate owner with name and email
      .sort({ generatedDate: -1 }) // Sort by most recent bills first
      .lean() as unknown as IBillPopulatedLean[]; // Add 'as unknown' here

    res.json(bills);
  } catch (error) {
    console.error('Error fetching owner bills:', error);
    res.status(500).json({
      message: 'Error fetching bills',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper function to assign colors to expense categories
function getExpenseColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Maintenance': '#3b82f6',
    'Electricity': '#10b981',
    'Water': '#f59e0b',
    'Security': '#8b5cf6',
    'Parking': '#ef4444',
    'Other': '#6b7280'
  };
  return colors[category] || '#6b7280';
}

export default router; 