import mongoose, { Schema, Document } from 'mongoose';
import { IOwnershipHistory } from '../types';

export interface IOwnershipHistoryDocument extends IOwnershipHistory, Document {}

const ownershipHistorySchema = new Schema<IOwnershipHistoryDocument>({
  flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true },
  previousOwnerId: { type: Schema.Types.ObjectId, ref: 'Owner', default: null },
  newOwnerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
  transferDate: { type: Date, default: Date.now, required: true },
  transferredBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  transferType: { type: String, enum: ['assignment', 'transfer'], required: true },
}, {
  timestamps: true,
});

export const OwnershipHistory = mongoose.model<IOwnershipHistoryDocument>('OwnershipHistory', ownershipHistorySchema); 