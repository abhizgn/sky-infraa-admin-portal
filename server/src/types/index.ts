import { Document } from 'mongoose';
import mongoose from 'mongoose';

// Define basic ObjectId type for clarity
export type ObjectId = mongoose.Types.ObjectId;

export interface IAdmin {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IOwner {
  _id: string;
  flatId: string | null;
  name: string;
  email: string;
  phone: string;
  flat_no?: string; // Make flat_no optional
  password: string;
  ownershipDate: Date;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IFlat {
  _id: ObjectId;
  flatNumber: string;
  floor: number;
  type: string;
  areaSqft: number;
  isOccupied: boolean;
  ownerId?: ObjectId | null;
  apartmentId: ObjectId;
  maintenanceCharge?: number;
}

export interface IArrear {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  flatId: mongoose.Types.ObjectId;
  month: string; // "YYYY-MM"
  amount: number;
  status: 'pending' | 'partial' | 'paid' | 'reminded';
  lastReminderSentAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  // Add populated types if needed for backend logic (e.g., within service functions)
  // owner?: IOwner;
  // flat?: IFlat;
}

// Add populated versions if you need them for responses
export interface IArrearPopulated extends Omit<IArrear, 'ownerId' | 'flatId'> {
   ownerId: IOwner; // Assuming IOwner is defined
   flatId: IFlatPopulated; // Assuming IFlat is defined
}

// Define a populated Flat interface for nested population within Arrears
export interface IFlatPopulated extends Omit<IFlat, 'ownerId' | 'apartmentId'> {
    apartmentId: IApartment; // Populated Apartment object
}

// Add backend type for Apartment if it's not already there
export interface IApartment {
    _id: ObjectId;
    name: string;
    address: string;
    // Add other apartment properties
}

// Example IBill (backend schema type) - adjust to match your Bill model
export interface IBill {
    _id: ObjectId;
    flatId: ObjectId; // Reference
    ownerId: ObjectId; // Reference
    amount: number;
    status: 'Paid' | 'Unpaid';
    dueDate: Date; // Use Date type
    generatedDate: Date; // Use Date type
    paymentDate?: Date; // Optional
    paymentMode?: string; // Optional
    transactionId?: string; // Optional
    // Add other bill properties
}

// Document interfaces
export interface IAdminDocument extends Document, Omit<IAdmin, '_id'> {}
export interface IOwnerDocument extends Document, Omit<IOwner, '_id'> {}
export interface IFlatDocument extends Document, Omit<IFlat, '_id'> {} 