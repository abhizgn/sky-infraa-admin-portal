import express from 'express';
import mongoose from 'mongoose'; // Import mongoose for ObjectId type
import { Bill } from '../models/Bills';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';
import { Flat } from '../models/Flat'; // Import Flat model
import { Owner } from '../models/Owner'; // <-- Import the Owner model
import { IOwner, IFlat, IApartment, IBill } from '../types'; // Import necessary interfaces

// Define a populated Bill interface for type assertions
interface IBillPopulated extends Omit<IBill, 'ownerId' | 'flatId'> {
  ownerId: IOwner;
  flatId: IFlat & { apartmentId: IApartment }; // Nested populated
}

const router = express.Router();

// Get all bills
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { month, year, apartmentId, search } = req.query;
    let query: any = {};
    let flatIds: mongoose.Types.ObjectId[] | undefined;

    if (apartmentId && apartmentId !== 'all') {
      const flatsInApartment = await Flat.find({ apartmentId: apartmentId as string }).select('_id');
      flatIds = flatsInApartment.map(flat => flat._id);
      if (flatIds.length === 0) {
        return res.json([]);
      }
      query.flatId = { $in: flatIds };
    }

    if (month) {
      query.month = String(month);
    }
    if (year) {
      query.year = Number(year);
    }

    // Explicitly cast to unknown first, then to IBillPopulated[]
    let bills = (await Bill.find(query)
      .populate({
        path: 'ownerId',
        select: 'name email phone',
      })
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId',
        populate: {
          path: 'apartmentId',
          select: 'name'
        }
      })
      .lean() as unknown) as IBillPopulated[]; // <-- Fix for conversion error


    if (search) {
      const searchTermLower = String(search).toLowerCase();
      bills = bills.filter((bill) => {
        // Access properties directly after the main cast.
        const ownerName = bill.ownerId?.name?.toLowerCase() || '';
        const flatNumber = bill.flatId?.flatNumber?.toLowerCase() || '';
        const apartmentName = bill.flatId?.apartmentId?.name?.toLowerCase() || ''; // <-- This should now work correctly
        return (
          ownerName.includes(searchTermLower) ||
          flatNumber.includes(searchTermLower) ||
          apartmentName.includes(searchTermLower)
        );
      });
    }

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

// Generate bills for all flats for a month
router.post('/generate', verifyToken, adminOnly, async (req, res) => {
  const { month, year, apartmentId } = req.body;
  let flats;
  if (apartmentId && apartmentId !== 'all') {
    flats = await Flat.find({ apartmentId });
  } else {
    flats = await Flat.find();
  }
  for (let flat of flats) {
    // Make sure owner is found and cast if needed for type consistency
    const owner = await Owner.findOne({ flatId: flat._id }).lean() as IOwner | null; // Added .lean() and cast
    if (!owner) continue;
    const existing = await Bill.findOne({ flatId: flat._id, month, year });
    if (!existing) {
      await Bill.create({
        flatId: flat._id,
        ownerId: owner._id, // owner._id is correct
        month,
        year,
        amount: flat.maintenanceCharge || 1500,
        dueDate: new Date(new Date().setDate(10)),
      });
    }
  }
  res.sendStatus(201);
});

// Mark bill as paid/unpaid
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  const updated = await Bill.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
    paymentDate: req.body.status === 'Paid' ? new Date() : null,
  }, { new: true });
  res.json(updated);
});

export default router;
