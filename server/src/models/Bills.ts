import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  flatId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  amount: number;
  status: 'Paid' | 'Unpaid';
  generatedDate: Date;
  dueDate: Date;
  paymentDate?: Date;
  receiptId?: string;
}

const billSchema = new Schema<IBill>({
  flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  generatedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date },
  receiptId: { type: String }
});

const Bill = mongoose.model<IBill>('Bill', billSchema);
export { Bill };
