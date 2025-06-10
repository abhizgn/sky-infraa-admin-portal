import mongoose from 'mongoose';
import { Owner } from '../models/Owner';
import { Flat } from '../models/Flat';

async function fixOwnerData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abhizgn1026:5nVJkTYWN6d0q3my@cluster0.wzp4ld5.mongodb.net/skyinfraa-panel?retryWrites=true&w=majority&appName=Cluster0');

    // Get all owners
    const owners = await Owner.find();
    
    for (const owner of owners) {
      // If owner has flatId, update flat_no
      if (owner.flatId) {
        owner.flat_no = `FLAT-${owner.flatId}`;
      } else {
        // If no flatId, remove flat_no
        owner.flat_no = undefined;
      }
      await owner.save();
    }

    console.log('Successfully fixed owner data');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing owner data:', error);
    process.exit(1);
  }
}

fixOwnerData(); 