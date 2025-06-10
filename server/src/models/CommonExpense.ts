import mongoose, { Schema, Document } from 'mongoose';

export interface ICommonExpense extends Document {
  apartmentId: mongoose.Types.ObjectId;
  month: string;
  year: number;
  title: string;
  description?: string;
  totalAmount: number;
  distributionType: 'fixed' | 'per_flat' | 'per_sqft';
  createdAt: Date;
  date: Date;
}

const commonExpenseSchema = new Schema({
  apartmentId: { type: Schema.Types.ObjectId, ref: 'Apartment', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  totalAmount: { type: Number, required: true },
  distributionType: { type: String, enum: ['fixed', 'per_flat', 'per_sqft'], required: true },
  createdAt: { type: Date, default: Date.now },
  date: { type: Date, required: true },
});

export const CommonExpense = mongoose.model<ICommonExpense>('CommonExpense', commonExpenseSchema);
