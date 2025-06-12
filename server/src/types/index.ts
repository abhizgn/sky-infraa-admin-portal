import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Request } from 'express';

// Define basic ObjectId type for clarity
export type ObjectId = mongoose.Types.ObjectId;

// Base interfaces for data properties (NO METHODS HERE)
export interface IAdmin {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
}

export interface IOwner {
  _id: ObjectId;
  flatId: ObjectId | null;
  name: string;
  email: string;
  phone: string;
  flat_no?: string;
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
}

export interface IApartment {
    _id: ObjectId;
    name: string;
    address: string;
    // Add other apartment properties
}

export interface IBill {
    _id: ObjectId;
    flatId: ObjectId; // Reference
    ownerId: ObjectId; // Reference
    month: number; // CHANGE THIS from string to number
    year: number; // Year as a number
    amount: number;
    status: 'Paid' | 'Unpaid';
    dueDate: Date;
    generatedDate: Date;
    paymentDate?: Date;
    paymentMode?: string;
    transactionId?: string;
    receiptId?: string;
}

// New Interface for Ownership History
export interface IOwnershipHistory {
  _id: ObjectId;
  flatId: ObjectId;
  previousOwnerId?: ObjectId | null;
  newOwnerId: ObjectId;
  transferDate: Date;
  transferredBy: ObjectId;
  transferType: 'assignment' | 'transfer';
  createdAt?: Date;
  updatedAt?: Date;
}


// Mongoose Document interfaces for the models, including custom methods.
// These extend Document<DataType, QueryHelpers, InstanceMethods>
// and then explicitly include the data type itself to ensure direct property access.
export interface IAdminDocument extends Document<ObjectId, any, IAdmin>, IAdmin {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IOwnerDocument extends Document<ObjectId, any, IOwner>, IOwner {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IFlatDocument extends Document<ObjectId, any, IFlat>, IFlat {}

export interface IArrearDocument extends Document<mongoose.Types.ObjectId, any, IArrear>, IArrear {}

export interface IOwnershipHistoryDocument extends Document<ObjectId, any, IOwnershipHistory>, IOwnershipHistory {}


// --- Populated & Leaned Server-side Types ---
// These interfaces represent the structure of documents AFTER .populate() and .lean()
export interface IFlatPopulatedLean extends Omit<IFlat, 'apartmentId' | 'ownerId'> {
  apartmentId: IApartment; // Populated Apartment object
  ownerId?: IOwner; // Populated Owner object (if ownerId was populated)
}

export interface IOwnerPopulatedLean extends Omit<IOwner, 'flatId'> {
  flatId?: IFlat; // Populated Flat object (if flatId was populated)
}

export interface IBillPopulatedLean extends Omit<IBill, 'flatId' | 'ownerId'> {
    _id: mongoose.Types.ObjectId; // Use mongoose.Types.ObjectId as .lean() returns native types
    flatId: IFlatPopulatedLean; // Nested populated Flat object
    ownerId: IOwner; // Populated Owner object (just IOwner since it's the top level populated object)
    // Add __v if it's consistently returned by .lean() and you need it
    __v?: number;
}


// --- Frontend specific types (if they share the same types.ts file) ---
// These are for the client-side data structures, which might be slightly different
// from the raw Mongoose document types (e.g., simplified for UI, or populated).
export interface MonthlyPayment {
  month: string;
  amount: number;
}

export interface ExpenseBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface RecentBill {
  month: string;
  amount: number;
  status: string;
  dueDate: string;
  receiptId: string | null;
}

// Frontend Owner interface for dashboard data.
export interface Owner { // Frontend Owner interface
  _id: ObjectId; // Assuming frontend uses string for IDs from ObjectId
  name: string;
  email: string;
  phone?: string;
  flatId?: ObjectId | null;
  flat?: IFlat; // Use IFlat for populated flat data in frontend
  status: 'active' | 'inactive';
  ownershipDate?: Date;
  createdAt?: string;
  updatedAt?: string;
  currentDue?: number;
  monthlyPayments?: MonthlyPayment[];
  expenseBreakdown?: ExpenseBreakdownItem[];
  recentBills?: RecentBill[];
  month?: string; // For the current month string on dashboard
  arrears?: IArrear[];
}


// If you need populated types for frontend, define them based on backend responses
export interface IArrearPopulated extends Omit<IArrear, 'ownerId' | 'flatId'> {
   ownerId: IOwner;
   flatId: IFlatPopulated;
}

export interface IFlatPopulated extends Omit<IFlat, 'ownerId' | 'apartmentId'> {
    apartmentId: IApartment;
}

// --- Custom Request Interface for Middleware ---
// Define the custom request type that includes the user property
export interface AuthRequest extends Request { // Export this interface
  user?: {
    id: string | ObjectId;
    role: 'admin' | 'owner';
    name: string;
    flat_no?: string;
  };
} 