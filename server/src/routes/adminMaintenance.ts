import { Router } from 'express';
import { Maintenance } from '../models/Maintenance';
import { Flat } from '../models/Flat'; // Import Flat model to use for filtering
import { verifyToken, adminOnly } from '../middleware/authMiddleware';

const router = Router();

// Get all maintenance items (with optional filters)
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { apartmentId, flatId, month, year } = req.query;
    let query: any = {};

    if (flatId) {
      query.flatId = flatId;
    } else if (apartmentId && apartmentId !== 'all') {
      // If filtering by apartment but not a specific flat, find all flats in that apartment
      const flatsInApartment = await Flat.find({ apartmentId: apartmentId as string }).select('_id');
      if (flatsInApartment.length === 0) {
        return res.json([]); // No flats in apartment, no maintenance items
      }
      query.flatId = { $in: flatsInApartment.map(f => f._id) };
    }

    if (month && year) {
        // Assuming your Maintenance model stores date as a Date object,
        // you'd query by date range for a specific month/year.
        // If it stores month/year as strings/numbers, adjust query accordingly.
        const startDate = new Date(Number(year), Number(month) -1, 1); // Month is 0-indexed for Date constructor
        const endDate = new Date(Number(year), Number(month), 0); // Last day of the month
        query.date = { $gte: startDate, $lte: endDate };
    }


    const maintenanceItems = await Maintenance.find(query)
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId',
        populate: {
          path: 'apartmentId',
          select: 'name'
        }
      })
      .sort({ date: -1 })
      .lean();

    res.json(maintenanceItems);
  } catch (error) {
    console.error('Error fetching maintenance items:', error);
    res.status(500).json({ message: 'Error fetching maintenance items' });
  }
});

// Add maintenance item
router.post('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const maintenanceItem = new Maintenance(req.body);
    await maintenanceItem.save();
    res.status(201).json(maintenanceItem);
  } catch (error) {
    console.error('Error creating maintenance item:', error);
    res.status(400).json({ message: 'Error creating maintenance item' });
  }
});

// Get maintenance items for a specific flat (existing route, keep it for specific flat pages if any)
router.get('/:flatId', verifyToken, adminOnly, async (req, res) => {
  try {
    const maintenanceItems = await Maintenance.find({ flatId: req.params.flatId })
      .populate('flatId', 'flatNumber')
      .sort({ date: -1 })
      .lean();
    res.json(maintenanceItems);
  } catch (error) {
    console.error('Error fetching maintenance items for flat:', error);
    res.status(500).json({ message: 'Error fetching maintenance items' });
  }
});

// Update maintenance item status (adjust as needed for full update)
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const updatedMaintenanceItem = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body, // Assume req.body contains the fields to update
      { new: true }
    );
    if (!updatedMaintenanceItem) {
      return res.status(404).json({ message: 'Maintenance item not found' });
    }
    res.json(updatedMaintenanceItem);
  } catch (error) {
    console.error('Error updating maintenance item:', error);
    res.status(400).json({ message: 'Error updating maintenance item' });
  }
});

export default router; 