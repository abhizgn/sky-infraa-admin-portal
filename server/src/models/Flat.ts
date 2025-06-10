import mongoose, { Document, Schema } from 'mongoose';
import { IFlat } from '../types'; // Import IFlat from types

// Define the Mongoose schema for Flat
// Use the correct interface IFlat and Document
const FlatSchema: Schema<IFlat> = new Schema({
  flatNumber: {
    type: String,
    required: true,
    trim: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  areaSqft: {
    type: Number,
    required: true,
  },
  isOccupied: {
    type: Boolean,
    default: false,
  },
  // Add the ownerId field with a reference to the Owner model
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner', // This tells Mongoose which model to use for population
    default: null, // A flat might not have an owner initially
  },
  apartmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment', // Assuming you have an Apartment model
    required: true,
  },
  maintenanceCharge: { // Example: if maintenance charge is per flat
    type: Number,
    default: 0,
  },
});

// Remove the problematic index and add a compound index for flat number uniqueness per apartment
FlatSchema.index({ apartmentId: 1, flatNumber: 1 }, { unique: true });

// Create and export the Flat model
const Flat = mongoose.model<IFlat>('Flat', FlatSchema); // Use IFlat here

export { Flat }; 