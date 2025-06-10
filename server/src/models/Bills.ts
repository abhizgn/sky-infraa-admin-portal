import mongoose, { Schema, Document } from 'mongoose';

export interface IBill extends Document {
  flatId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  amount: number;
  status: 'Paid' | 'Unpaid';
  generatedDate: Date;
  dueDate: Date;
  paymentDate?: Date;
}

const billSchema = new Schema({
  flatId: { type: Schema.Types.ObjectId, ref: 'Flat', required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'Owner', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  generatedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date }
});

const Bill = mongoose.model<IBill>('Bill', billSchema);
export { Bill };
