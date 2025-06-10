import mongoose, { Document, Schema } from 'mongoose';

export interface IApartment extends Document {
  name: string;
  location: string;
  totalFloors: number;
  createdAt: Date;
  updatedAt: Date;
}

const apartmentSchema = new Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  totalFloors: { type: Number, required: true, min: 1 }
}, { timestamps: true });

export const Apartment = mongoose.model<IApartment>('Apartment', apartmentSchema); 