import mongoose, { Schema, Document } from 'mongoose';
import { IArrear } from '../types'; // Import IArrear from your types

export interface IArrearDocument extends IArrear, Document {}

const arrearSchema = new Schema<IArrearDocument>({
  ownerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
  flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true },
  month: { type: String, required: true }, // e.g., "2024-10" or "October 2024"
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'partial', 'paid', 'reminded'], default: 'pending' },
  lastReminderSentAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// Add a unique index to prevent duplicate arrears for the same flat/month
arrearSchema.index({ flatId: 1, month: 1 }, { unique: true });

export const Arrear = mongoose.model<IArrearDocument>('Arrear', arrearSchema); 