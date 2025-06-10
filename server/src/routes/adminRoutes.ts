import { Router } from 'express';
import { Admin } from '../models/Admin';
import { Owner } from '../models/Owner';
import { Flat } from '../models/Flat';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';
import { Apartment } from '../models/Apartment';
import { Bill } from '../models/Bills';

const router = Router();

// Get dashboard summary
router.get('/dashboard/summary', verifyToken, adminOnly, async (req, res) => {
  try {
    const [totalFlats, totalOwners] = await Promise.all([
      Flat.countDocuments(),
      Owner.countDocuments(),
    ]);

    res.json({
      totalFlats,
      totalOwners,
      pendingBills: 0,
      totalArrears: 0,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Error fetching dashboard summary' });
  }
});

// Get all apartments
router.get('/apartments', verifyToken, adminOnly, async (req, res) => {
  try {
    const apartments = await Apartment.find().sort({ createdAt: -1 });
    res.json(apartments);
  } catch (error) {
    console.error('Error fetching apartments:', error);
    res.status(500).json({ message: 'Error fetching apartments' });
  }
});

// Create new apartment
router.post('/apartments', verifyToken, adminOnly, async (req, res) => {
  try {
    const apartment = new Apartment(req.body);
    await apartment.save();
    res.status(201).json(apartment);
  } catch (error) {
    console.error('Error creating apartment:', error);
    res.status(400).json({ message: 'Error creating apartment' });
  }
});

// Update apartment
router.put('/apartments/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    res.json(apartment);
  } catch (error) {
    console.error('Error updating apartment:', error);
    res.status(400).json({ message: 'Error updating apartment' });
  }
});

// Delete apartment
router.delete('/apartments/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const apartment = await Apartment.findByIdAndDelete(req.params.id);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting apartment:', error);
    res.status(400).json({ message: 'Error deleting apartment' });
  }
});

// Get flats by apartment
router.get('/flats', verifyToken, adminOnly, async (req, res) => {
  try {
    const { apartmentId } = req.query;

    // Remove or comment out this check
    // if (!apartmentId) {
    //   return res.status(400).json({ message: 'Apartment ID is required' });
    // }

    // Keep this conditional query logic
    const query = apartmentId ? { apartmentId } : {};

    const flats = await Flat.find(query)
      .populate('ownerId')
      .populate('apartmentId'); // Ensure population is correct
    res.json(flats);
  } catch (error) {
    console.error('Error fetching flats:', error); // Log the actual backend error for debugging
    res.status(500).json({ message: 'Error fetching flats' });
  }
});

// Create new flat
router.post('/flats', verifyToken, adminOnly, async (req, res) => {
  try {
    const flat = new Flat(req.body);
    await flat.save();
    res.status(201).json(flat);
  } catch (error) {
    console.error('Error creating flat:', error);
    res.status(400).json({ message: 'Error creating flat' });
  }
});

// Update flat
router.put('/flats/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const flat = await Flat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found' });
    }
    res.json(flat);
  } catch (error) {
    console.error('Error updating flat:', error);
    res.status(400).json({ message: 'Error updating flat' });
  }
});

// Delete flat
router.delete('/flats/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const flat = await Flat.findByIdAndDelete(req.params.id);
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting flat:', error);
    res.status(400).json({ message: 'Error deleting flat' });
  }
});

// Get bills
router.get('/bills', verifyToken, adminOnly, async (req, res) => {
  try {
    const { month, year, apartmentId } = req.query;

    // Build query based on provided parameters
    const query = {
      ...(month && { month }),
      ...(year && { year }),
      ...(apartmentId && { 'flatId.apartmentId': apartmentId }),
    };

    const bills = await Bill.find(query)
      // Populate ownerId and select only the name field
      .populate('ownerId', 'name')
      // Populate flatId and then nested apartmentId within flatId, selecting name
      .populate({
         path: 'flatId',
         populate: {
            path: 'apartmentId',
            select: 'name'
         }
      });

    res.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error); // Log the actual backend error
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

export default router; 