import express from 'express';
import { verifyToken,adminOnly } from '../middleware/authMiddleware'; // Assuming your auth middleware is here
import { Arrear } from '../models/Arrear'; // Import the Arrear model
import { Owner } from '../models/Owner'; // Import Owner model for reminder route
import { IArrear, IOwner, IFlat, IApartment } from '../types'; // Import the populated interface
import { Flat } from '../models/Flat'; // Import Flat model for population
import mongoose from 'mongoose'; // Import mongoose

const router = express.Router();

// Define extended interfaces to represent the populated state
// These interfaces describe the *expected shape after population*
interface IFlatPopulatedForArrear extends Omit<IFlat, 'apartmentId' | 'ownerId'> {
  apartmentId: IApartment; // apartmentId will be the full Apartment object
  ownerId?: IOwner; // ownerId will be the full Owner object if populated
}

interface IOwnerPopulatedForArrear extends Omit<IOwner, 'flatId'> {
  flatId?: IFlat; // flatId will be the full Flat object if populated
}

interface IArrearPopulated extends Omit<IArrear, 'ownerId' | 'flatId'> {
  ownerId: IOwnerPopulatedForArrear; // ownerId will be the full populated Owner object
  flatId: IFlatPopulatedForArrear; // flatId will be the full populated Flat object (with its apartment)
}

// Helper function for sending reminders (placeholder)
// In a real application, you would integrate with a third-party service
const sendReminderNotification = async (contact: string, message: string): Promise<void> => {
  console.log(`Sending reminder to ${contact}: "${message}"`);
  // TODO: Implement actual SMS, WhatsApp, or Email sending logic here
  // For now, we'll just simulate success
  return Promise.resolve();
};


// GET all arrears with optional filters (Apartment, Month, Owner)
router.get('/', verifyToken, adminOnly, async (req, res) => {
  try {
    const { apartmentId, month, year, search } = req.query;
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

    // Perform population and then cast the result, first to unknown, then to IArrearPopulated[]
    let arrears = (await Arrear.find(query)
      .populate({
        path: 'ownerId',
        select: 'name email phone flatId',
      })
      .populate({
        path: 'flatId',
        select: 'flatNumber apartmentId',
        populate: {
          path: 'apartmentId',
          select: 'name address'
        }
      })
      .lean() as unknown) as IArrearPopulated[]; // <-- Concise fix: Added 'as unknown' here

    // If you need to filter by owner name, flat number, or apartment name:
    if (search) {
      const searchTermLower = String(search).toLowerCase();
      arrears = arrears.filter((arrear) => {
        const ownerName = arrear.ownerId?.name?.toLowerCase() || '';
        const flatNumber = arrear.flatId?.flatNumber?.toLowerCase() || '';
        const apartmentName = arrear.flatId?.apartmentId?.name?.toLowerCase() || '';
        return (
          ownerName.includes(searchTermLower) ||
          flatNumber.includes(searchTermLower) ||
          apartmentName.includes(searchTermLower)
        );
      });
    }

    res.json(arrears);
  } catch (error) {
    console.error('Error fetching arrears:', error);
    res.status(500).json({ message: 'Error fetching arrears' });
  }
});

// POST send reminder to a specific owner/arrear
// The request body could specify which specific arrear(s) to remind about,
// but the sample route suggests sending reminder for a specific owner ID.
// Let's adapt the route to take arrear ID for now as it seems more direct.
// If you need to send reminders for ALL pending arrears for an owner,
// the route signature and logic would need adjustment.
router.post('/:arrearId/reminder', verifyToken,adminOnly, async (req, res) => {
   try {
      const { arrearId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(arrearId)) {
         return res.status(400).json({ message: 'Invalid Arrear ID' });
      }

      // Populate owner and flat with their respective interfaces
      const arrear = await Arrear.findById(arrearId)
         .populate<{ ownerId: IOwner }>('ownerId') // Type assertion for ownerId within populate
         .populate<{ flatId: IFlat & { apartmentId: IApartment } }>({ // Type assertion for flatId and nested apartmentId
            path: 'flatId',
            populate: {
               path: 'apartmentId',
               select: 'name'
            }
         })
         .lean();

      // Check if population was successful and types are as expected
      if (!arrear || typeof arrear.ownerId === 'string' || typeof arrear.flatId === 'string' || !arrear.ownerId || !arrear.flatId) {
         console.error(`Arrear ${arrearId} found, but owner or flat population failed or incorrect type. Arrear:`, arrear);
         return res.status(404).json({ message: 'Arrear or associated owner/flat not found' });
      }

      // Assert the types after checks for safer access (though populate's generic should help)
      const owner = arrear.ownerId as IOwner; // Further cast if needed by your IOwner interface
      const flat = arrear.flatId as (IFlat & { apartmentId: IApartment }); // Further cast for flat and nested apartment

      // Compose message (using data from the populated arrear, owner, and flat)
      const message = `Dear ${owner.name}, this is a reminder about your pending maintenance due of ₹${arrear.amount} for flat ${flat.flatNumber} for the month of ${arrear.month}. Please pay soon.`;

      // Determine contact method
      const contact = owner.phone || owner.email;

      if (!contact) {
          console.warn(`Owner ${owner._id} for arrear ${arrearId} has no contact information.`);
          return res.status(400).json({ message: 'Owner has no contact information to send reminder.' });
      }

      // Call notification service (placeholder)
      await sendReminderNotification(contact, message);

      // Fetch the original document again to update it (lean() returns plain object, not Mongoose doc)
      const updatedArrear = await Arrear.findById(arrearId);
       if(updatedArrear) {
         updatedArrear.status = 'reminded';
         updatedArrear.lastReminderSentAt = new Date();
         await updatedArrear.save();
       }

      res.json({ message: 'Reminder sent successfully', arrearId: arrear._id });

   } catch (error) {
      console.error('Error sending reminder:', error);
      res.status(500).json({ message: 'Failed to send reminder' });
   }
});


// GET export arrears data
router.get('/export', verifyToken,adminOnly, async (req, res) => {
  try {
    const { apartmentId, month, ownerId, status } = req.query;
    const query: any = {};

    // Apply default status filter if no specific status is requested
    const statusFilter = typeof status === 'string' ? status.split(',') : ['pending', 'partial', 'reminded'];
    if(statusFilter.length > 0) {
       query.status = { $in: statusFilter };
    }

    if (month && typeof month === 'string') {
      query.month = month;
    }

    if (ownerId && typeof ownerId === 'string' && mongoose.Types.ObjectId.isValid(ownerId)) {
       query.ownerId = new mongoose.Types.ObjectId(ownerId);
    }

    let flatObjectIds: mongoose.Types.ObjectId[] | undefined;
    if (apartmentId && typeof apartmentId === 'string' && mongoose.Types.ObjectId.isValid(apartmentId)) {
        const flatsInApartment = await Flat.find({ apartmentId: new mongoose.Types.ObjectId(apartmentId) }).select('_id').lean();
         flatObjectIds = flatsInApartment.map(flat => flat._id);
        if (flatObjectIds.length === 0) {
             return res.json([]); // Or send an empty file/error
        }
         query.flatId = { $in: flatObjectIds };
    }

    // Fetch the filtered arrears data with necessary populations
    const arrearsToExport = await Arrear.find(query)
       .populate('ownerId', 'name phone email')
       .populate({
          path: 'flatId',
          select: 'flatNumber apartmentId',
          populate: {
             path: 'apartmentId',
             select: 'name'
          }
       })
       .lean();


    // TODO: Implement PDF or Excel generation logic here
    // This part depends on the libraries you choose (e.g., 'pdfmake', 'exceljs')
    console.log('Generating export for arrears:', arrearsToExport);

    // Example: Sending a dummy response for now
    res.status(501).json({ message: 'Export functionality not yet implemented' });
    // In a real scenario, you would generate the file and send it like:
    // res.setHeader('Content-Type', 'application/pdf'); // or 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' for Excel
    // res.setHeader('Content-Disposition', 'attachment; filename=arrears.pdf'); // or .xlsx
    // res.send(generatedFileBuffer);

  } catch (error) {
    console.error('Error exporting arrears:', error);
    res.status(500).json({ message: 'Failed to generate export' });
  }
});


export default router; 