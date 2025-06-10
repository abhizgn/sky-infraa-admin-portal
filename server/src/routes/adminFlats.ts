import express from 'express';
import { Flat } from '../models/Flat';
import { Owner } from '../models/Owner';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Get all flats (for an apartment if needed)
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { apartmentId, isOccupied } = req.query;
    console.log('Fetching flats with query:', { apartmentId, isOccupied }); // Debug log
    
    const query: any = {};
    if (apartmentId) {
      query.apartmentId = apartmentId;
    }
    if (isOccupied === 'false') {
      query.isOccupied = false;
      query.ownerId = null;
    }

    console.log('Final query:', query); // Debug log
    const flats = await Flat.find(query)
      .populate('ownerId')
      .populate('apartmentId');
    console.log('Found flats:', flats); // Debug log
    
    res.json(flats);
  } catch (error) {
    console.error('Error fetching flats:', error);
    res.status(500).json({ message: 'Error fetching flats' });
  }
});

// Create flat
router.post('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { flatNumber, floor, type, areaSqft, apartmentId } = req.body;

    // Validate required fields
    if (!flatNumber || !apartmentId) {
      return res.status(400).json({ 
        message: 'Flat number and apartment ID are required.' 
      });
    }

    // Check if flat number already exists in the apartment
    const existingFlat = await Flat.findOne({ 
      flatNumber, 
      apartmentId 
    });

    if (existingFlat) {
      return res.status(400).json({ 
        message: 'Flat number already exists in this apartment.' 
      });
    }

    // Create new flat with validated data
    const flat = new Flat({
      flatNumber,
      floor: floor || 1,
      type: type || '2BHK',
      areaSqft: areaSqft || 1000,
      apartmentId,
      isOccupied: false,
      maintenanceCharge: 0
    });

    await flat.save();

    // Populate the apartment information before sending response
    const populatedFlat = await Flat.findById(flat._id)
      .populate('apartmentId', 'name')
      .lean();

    res.status(201).json(populatedFlat);
  } catch (error: any) {
    console.error('Error creating flat:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Flat number already exists in this apartment.' 
      });
    }

    res.status(400).json({ 
      message: 'Error creating flat',
      error: error.message 
    });
  }
});

// Update flat
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const flat = await Flat.findByIdAndUpdate(req.params.id, req.body, { new: true });
     if (!flat) {
       return res.status(404).json({ message: 'Flat not found' });
     }
    res.json(flat);
  } catch (error) {
    res.status(400).json({ message: 'Error updating flat' });
  }
});

// Delete flat
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const flat = await Flat.findByIdAndDelete(req.params.id);
     if (!flat) {
       return res.status(404).json({ message: 'Flat not found' });
     }
    res.json({ message: 'Flat deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting flat' });
  }
});

// Assign owner to flat
router.put('/:id/assign-owner', verifyToken, adminOnly, async (req, res) => {
  try {
    const { ownerId } = req.body;
    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required.' });
    }

    // Find the flat to be assigned
    const flatToAssign = await Flat.findById(req.params.id);
    if (!flatToAssign) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    // If the flat was previously assigned, unassign it from the old owner
    if (flatToAssign.ownerId) {
      await Owner.findByIdAndUpdate(
        flatToAssign.ownerId,
        { flatId: null },
        { new: true }
      );
    }

    // Assign the flat to the new owner
    const updatedFlat = await Flat.findByIdAndUpdate(
      req.params.id,
      { ownerId, isOccupied: true },
      { new: true }
    );

    // Update the owner to reference this flat
    await Owner.findByIdAndUpdate(
      ownerId,
      { flatId: req.params.id },
      { new: true }
    );

    res.json(updatedFlat);
  } catch (error) {
    console.error('Error assigning owner to flat:', error);
    res.status(400).json({
      message: 'Error assigning owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Unassign owner from flat
router.put('/:id/unassign-owner', verifyToken, adminOnly, async (req, res) => {
  try {
    // Find the flat to unassign
    const flatToUnassign = await Flat.findById(req.params.id);
    if (!flatToUnassign) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    // Unassign the flat
    const updatedFlat = await Flat.findByIdAndUpdate(
      req.params.id,
      { ownerId: null, isOccupied: false },
      { new: true }
    );

    // If there was an owner, update that owner to clear their flatId
    if (flatToUnassign.ownerId) {
      await Owner.findByIdAndUpdate(
        flatToUnassign.ownerId,
        { flatId: null },
        { new: true }
      );
    }

    res.json(updatedFlat);
  } catch (error) {
    console.error('Error unassigning owner from flat:', error);
    res.status(400).json({
      message: 'Error unassigning owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
