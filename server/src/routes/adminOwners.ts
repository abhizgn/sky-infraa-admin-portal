import { Router } from 'express';
import { Owner } from '../models/Owner';
import { Flat } from '../models/Flat';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';
import { IFlat, IOwner } from '../types';

const router = Router();

// --- Specific Routes First ---

// List unassigned owners (owners with no flatId assigned) - THIS MUST COME BEFORE /:id
router.get('/unassigned', verifyToken, adminOnly, async (req, res) => {
  try {
    console.log('Attempting to fetch unassigned owners...');
    const unassignedOwners = await Owner.find({
      flatId: null,
      status: 'active'
    }).select('name email phone _id');

    console.log('Successfully found unassigned owners:', unassignedOwners);
    res.json(unassignedOwners);
  } catch (error: any) {
    console.error('Detailed error fetching unassigned owners:', error);
    res.status(500).json({
      message: 'Error fetching unassigned owners',
      details: error.message,
    });
  }
});

// List unassigned flats (flats with no ownerId assigned) - THIS MUST COME BEFORE /flats/:id
router.get('/flats/unassigned', verifyToken, adminOnly, async (req, res) => {
  try {
    const assignedFlatIds = (await Owner.find({ flatId: { $ne: null } })).map(o => o.flatId);
    const flats = await Flat.find({ _id: { $nin: assignedFlatIds } });
    res.json(flats.map(f => ({
      _id: f._id,
      flatNumber: f.flatNumber,
      apartment: f.apartmentId ? { name: (f.apartmentId as any).name } : undefined // Assuming apartmentId might be populated
    })));
  } catch (error) {
    console.error('Error fetching unassigned flats:', error);
    res.status(500).json({
      message: 'Error fetching unassigned flats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


// --- General Routes ---

// List all owners
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const owners = await Owner.find()
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId isOccupied ownerId',
        populate: {
          path: 'apartmentId',
          select: 'name'
        }
      })
      .lean();

    console.log('Fetched owners with populated flat details:', owners);
    res.json(owners);
  } catch (error) {
    console.error('Error fetching owners:', error);
    res.status(500).json({
      message: 'Error fetching owners',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add new owner
router.post('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, phone, email, flatId } = req.body;
    console.log('Creating owner with data:', { name, phone, email, flatId });

    if (email) {
      const existingOwner = await Owner.findOne({ email });
      if (existingOwner) {
        return res.status(400).json({
          message: 'An owner with this email already exists'
        });
      }
    }

    // Create the owner
    const owner = new Owner({
      name,
      phone,
      email: email || undefined,
      flatId: flatId || null,
      status: 'active',
      password: phone,
      flat_no: flatId ? `FLAT-${flatId}` : undefined
    });
    await owner.save();

    // If a flatId was provided, update the flat to be occupied and assigned to this owner
    if (flatId) {
      // First, unassign the flat from any *previous* owner it might have had
      await Owner.updateMany({ flatId }, { $set: { flatId: null } });

      // Then, assign the flat to the new owner
      await Flat.findByIdAndUpdate(
        flatId,
        { ownerId: owner._id, isOccupied: true },
        { new: true }
      );
    }

    const populatedOwner = await Owner.findById(owner._id)
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId',
        populate: {
          path: 'apartmentId',
          select: 'name'
        }
      })
      .lean();

    console.log('Created owner:', populatedOwner);
    res.status(201).json(populatedOwner);
  } catch (error: any) {
    console.error('Error creating owner:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        message: `An owner with this ${field} already exists`
      });
    } else {
      res.status(500).json({
        message: 'Error creating owner',
        error: error.message
      });
    }
  }
});

// Update owner
router.put('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, phone, email, flatId } = req.body;
    const ownerId = req.params.id;

    const currentOwner = await Owner.findById(ownerId);
    if (!currentOwner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    const oldFlatId = currentOwner.flatId;
    const newFlatId = flatId === 'null' ? null : flatId;

    // Update the owner
    const updatedOwner = await Owner.findByIdAndUpdate(
      ownerId,
      {
        name,
        phone,
        email,
        flatId: newFlatId,
        flat_no: newFlatId ? `FLAT-${newFlatId}` : undefined
      },
      { new: true }
    );

    // Add null check for updatedOwner
    if (!updatedOwner) {
      return res.status(404).json({ message: 'Owner not found after update' });
    }

    // Handle flat assignment/unassignment logic
    if (oldFlatId && String(oldFlatId) !== String(newFlatId)) {
      // If flat is changed or unassigned from old flat
      await Flat.findByIdAndUpdate(
        oldFlatId,
        { ownerId: null, isOccupied: false },
        { new: true }
      );
    }

    if (newFlatId && String(newFlatId) !== String(oldFlatId)) {
      // If a new flat is assigned
      // First, ensure the new flat is unassigned from any *other* owner
      await Owner.updateMany({ flatId: newFlatId }, { $set: { flatId: null } });

      await Flat.findByIdAndUpdate(
        newFlatId,
        { ownerId: ownerId, isOccupied: true },
        { new: true }
      );
    }

    const populatedOwner = await Owner.findById(updatedOwner._id)
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId',
        populate: {
          path: 'apartmentId',
          select: 'name'
        }
      })
      .lean();

    console.log('Updated owner:', populatedOwner);
    res.json(populatedOwner);
  } catch (error: any) {
    console.error('Error updating owner:', error);
    res.status(500).json({
      message: 'Error updating owner',
      error: error.message
    });
  }
});

// Soft delete (deactivate) or unassign
router.delete('/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const owner = await Owner.findByIdAndUpdate(req.params.id, { status: 'inactive', flatId: null });
    if (owner && owner.flatId) {
      await Flat.findByIdAndUpdate(
        owner.flatId,
        { ownerId: null, isOccupied: false },
        { new: true }
      );
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting owner:', error);
    res.status(500).json({
      message: 'Error deleting owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get owner by ID - THIS MUST COME AFTER SPECIFIC ROUTES
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id)
      .populate<{ flat: IFlat }>('flatId'); // Populate flat details

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.json(owner);
  } catch (error) {
    console.error('Error fetching owner by ID:', error); // More specific error log
    res.status(500).json({
      message: 'Error fetching owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
