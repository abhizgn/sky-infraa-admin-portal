import express, { Request, Response } from 'express';
import { Flat } from '../models/Flat';
import { Owner } from '../models/Owner';
import { OwnershipHistory } from '../models/OwnershipHistory';
import { verifyToken, adminOnly } from '../middleware/authMiddleware';
import { IAdminDocument, IOwnerDocument, IFlatDocument, IOwnershipHistoryDocument, AuthRequest, ObjectId } from '../types';

const router = express.Router();

// Get all flats (for an apartment if needed)
router.get('/', verifyToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { apartmentId, isOccupied } = req.query;
    console.log('Fetching flats with query:', { apartmentId, isOccupied });
    
    const query: any = {};
    if (apartmentId) {
      query.apartmentId = apartmentId;
    }
    if (isOccupied === 'false') {
      query.isOccupied = false;
      query.ownerId = null;
    }

    console.log('Final query:', query);
    const flats = await Flat.find(query)
      .populate('ownerId')
      .populate('apartmentId') as IFlatDocument[];
    console.log('Found flats:', flats);
    
    res.json(flats);
  } catch (error) {
    console.error('Error fetching flats:', error);
    res.status(500).json({ message: 'Error fetching flats' });
  }
});

// Create flat
router.post('/', verifyToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { flatNumber, floor, type, areaSqft, apartmentId } = req.body;

    if (!flatNumber || !apartmentId) {
      return res.status(400).json({ 
        message: 'Flat number and apartment ID are required.' 
      });
    }

    const existingFlat = await Flat.findOne({ 
      flatNumber, 
      apartmentId 
    }) as IFlatDocument | null;

    if (existingFlat) {
      return res.status(400).json({ 
        message: 'Flat number already exists in this apartment.' 
      });
    }

    const flat = new Flat({
      flatNumber,
      floor: floor || 1,
      type: type || '2BHK',
      areaSqft: areaSqft || 1000,
      apartmentId,
      isOccupied: false,
      maintenanceCharge: 0
    });

    await (flat as IFlatDocument).save();

    const populatedFlat = await Flat.findById(flat._id)
      .populate('apartmentId', 'name')
      .lean();

    res.status(201).json(populatedFlat);
  } catch (error: any) {
    console.error('Error creating flat:', error);
    
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
router.put('/:id', verifyToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const flat = await Flat.findByIdAndUpdate(req.params.id, req.body, { new: true }) as IFlatDocument | null;
     if (!flat) {
       return res.status(404).json({ message: 'Flat not found' });
     }
    res.json(flat);
  } catch (error) {
    res.status(400).json({ message: 'Error updating flat' });
  }
});

// Delete flat
router.delete('/:id', verifyToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const flat = await Flat.findByIdAndDelete(req.params.id) as IFlatDocument | null;
     if (!flat) {
       return res.status(404).json({ message: 'Flat not found' });
     }
    res.json({ message: 'Flat deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting flat' });
  }
});

// Assign owner to flat
router.put('/:id/assign-owner', verifyToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { ownerId } = req.body;
    if (!ownerId) {
      return res.status(400).json({ message: 'Owner ID is required.' });
    }

    const flatToAssign = await Flat.findById(req.params.id) as IFlatDocument | null;
    if (!flatToAssign) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    if (flatToAssign.ownerId) {
      await Owner.findByIdAndUpdate(
        flatToAssign.ownerId,
        { flatId: null },
        { new: true }
      ) as IOwnerDocument | null;
    }

    const updatedFlat = await Flat.findByIdAndUpdate(
      req.params.id,
      { ownerId, isOccupied: true },
      { new: true }
    ) as IFlatDocument | null;

    await Owner.findByIdAndUpdate(
      ownerId,
      { flatId: req.params.id },
      { new: true }
    ) as IOwnerDocument | null;

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
router.put('/:id/unassign-owner', verifyToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const flatToUnassign = await Flat.findById(req.params.id) as IFlatDocument | null;
    if (!flatToUnassign) {
      return res.status(404).json({ message: 'Flat not found' });
    }

    const updatedFlat = await Flat.findByIdAndUpdate(
      req.params.id,
      { ownerId: null, isOccupied: false },
      { new: true }
    ) as IFlatDocument | null;

    if (flatToUnassign.ownerId) {
      await Owner.findByIdAndUpdate(
        flatToUnassign.ownerId,
        { flatId: null },
        { new: true }
      ) as IOwnerDocument | null;
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

// New Route: Transfer Flat Ownership
router.post('/transfer-ownership', verifyToken, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { flatId, newOwnerDetails } = req.body;
    const adminId = req.user?.id;

    if (!flatId || !newOwnerDetails || !adminId) {
      return res.status(400).json({ message: 'Missing required transfer details.' });
    }

    const flat = await Flat.findById(flatId) as IFlatDocument | null;
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found.' });
    }

    const previousOwnerId = flat.ownerId;
    let newOwner: IOwnerDocument | null = null;
    let transferType: 'assignment' | 'transfer' = 'assignment';

    // 1. Handle Previous Owner (if exists and is assigned to this flat)
    if (previousOwnerId) {
      const prevOwner = await Owner.findById(previousOwnerId) as IOwnerDocument | null;
      if (prevOwner && prevOwner.flatId?.toString() === flat._id.toString()) {
        prevOwner.flatId = null;
        prevOwner.status = 'inactive';
        await prevOwner.save();
        transferType = 'transfer';
        console.log(`Previous owner ${prevOwner.name} unassigned from flat ${flat.flatNumber}`);
      }
    }

    // 2. Find or Create New Owner
    const { name, email, phone, password } = newOwnerDetails;

    if (!email || !password || !name || !phone) {
        return res.status(400).json({ message: 'New owner details (name, email, phone, password) are required.' });
    }

    let existingOwner = await Owner.findOne({ email }) as IOwnerDocument | null;

    if (existingOwner) {
      if (existingOwner.flatId) {
        return res.status(400).json({ message: `Owner with email ${email} is already assigned to another flat.` });
      }
      newOwner = existingOwner;
      newOwner.flatId = flat._id;
      newOwner.status = 'active';
      newOwner.phone = phone;
      newOwner.name = name;
      await (newOwner as IOwnerDocument).save();
      console.log(`Existing owner ${newOwner.name} assigned to flat ${flat.flatNumber}`);
    } else {
      newOwner = new Owner({
        name,
        email,
        phone,
        password,
        flatId: flat._id,
        status: 'active',
        ownershipDate: new Date(),
      });

      await (newOwner as IOwnerDocument).save();

      console.log(`New owner ${newOwner.name} created and assigned to flat ${flat.flatNumber}`);
    }

    // Ensure newOwner is not null before proceeding
    if (!newOwner) {
      return res.status(500).json({ message: 'Failed to create or find new owner.' });
    }

    // 3. Update Flat
    flat.ownerId = newOwner._id;
    flat.isOccupied = true;
    await flat.save();
    console.log(`Flat ${flat.flatNumber} updated with new owner.`);

    // 4. Record Ownership History
    const historyEntry = new OwnershipHistory({
      flatId: flat._id,
      previousOwnerId: previousOwnerId,
      newOwnerId: newOwner._id,
      transferDate: new Date(),
      transferredBy: adminId as ObjectId,
      transferType: transferType,
    });

    await (historyEntry as IOwnershipHistoryDocument).save();
    console.log('Ownership history recorded.');

    // Respond with updated flat and new owner details
    const populatedFlat = await Flat.findById(flat._id)
      .populate('ownerId')
      .populate('apartmentId')
      .lean();

    res.status(200).json({
      message: 'Flat ownership transferred successfully',
      flat: populatedFlat,
      newOwner: newOwner.toObject(),
    });

  } catch (error: any) {
    console.error('Error transferring ownership:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate entry: A user with this email or flat number might already exist.' });
    }
    res.status(500).json({
      message: 'Failed to transfer ownership',
      error: error.message || 'Unknown error'
    });
  }
});

export default router;
