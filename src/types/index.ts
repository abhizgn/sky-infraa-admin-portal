// Define basic ObjectId type if not already defined
export type ObjectId = string;

export interface Apartment {
  _id: ObjectId;
  name: string;
  address: string;
  // Add other relevant apartment properties
}

export interface Owner {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  // Add other relevant owner properties
}

export interface Flat {
  _id: ObjectId;
  flatNumber: string;
  floor: number;
  type: string; // e.g., 1BHK, 2BHK
  areaSqft: number;
  isOccupied: boolean;
  owner?: Owner; // Populate owner details
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
  // Add other relevant common expense properties
} 