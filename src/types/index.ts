// Define basic ObjectId type if not already defined
export type ObjectId = string;

export interface Apartment {
  _id: ObjectId;
  name: string;
  address?: string;
  // Add other relevant apartment properties
}

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

export interface Arrear {
  _id: ObjectId; // Assuming MongoDB ObjectId will be sent as a string
  ownerId: ObjectId;
  flatId: ObjectId;
  month: string; // e.g., "October 2024" or "2024-10"
  amount: number;
  status: 'pending' | 'partial' | 'paid' | 'reminded';
  lastReminderSentAt?: Date | null; // Can be Date object or string from backend
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Owner {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  flatId?: ObjectId | null;
  flat?: Flat | null;
  status: 'active' | 'inactive';
  ownershipDate?: Date;
  createdAt?: string;
  updatedAt?: string;
  currentDue?: number;
  monthlyPayments?: MonthlyPayment[];
  expenseBreakdown?: ExpenseBreakdownItem[];
  recentBills?: RecentBill[];
  month?: string;
  arrears?: Arrear[]; // Add arrears to Owner interface
  // Add other relevant owner properties
}

export interface Flat {
  _id: ObjectId;
  flatNumber: string;
  floor: number;
  type: string; // e.g., 1BHK, 2BHK
  areaSqft: number;
  isOccupied: boolean;
  owner?: Owner;
  apartmentId: ObjectId;
  apartment?: Apartment;
  // Add other relevant flat properties
}

export interface MaintenanceItem {
  _id: ObjectId;
  name: string;
  description?: string;
  amount: number;
  date: Date;
  flatId: ObjectId;
  status: 'pending' | 'paid' | 'cancelled';
  // Add other relevant maintenance properties
}

export interface CommonExpenseItem {
  _id: ObjectId;
  name: string;
  description?: string;
  amount: number;
  date: Date;
  apartmentId: ObjectId;
  distributionType?: 'fixed' | 'per_flat' | 'per_sqft';
  // Add other relevant common expense properties
} 