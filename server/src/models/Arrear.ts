import mongoose, { Document, Schema } from 'mongoose';
import { IArrear } from '../types'; // We'll define IArrear in types

// Define the Mongoose schema for Arrear
const ArrearSchema: Schema<IArrear> = new Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true,
  },
  flatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flat',
    required: true,
  },
  month: {
    type: String, // Format like "YYYY-MM"
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'reminded'], // Added 'paid' and 'reminded' statuses
    default: 'pending',
  },
  lastReminderSentAt: {
    type: Date,
    default: null,
  },
  // Add a reference to the Bill that generated this arrear? (Optional, depends on your data model)
  // billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
}, { timestamps: true }); // Add timestamps for createdAt/updatedAt

// Add a unique index to prevent duplicate arrears for the same flat/month
ArrearSchema.index({ flatId: 1, month: 1 }, { unique: true });


// Create and export the Arrear model
const Arrear = mongoose.model<IArrear>('Arrear', ArrearSchema);

export { Arrear }; 