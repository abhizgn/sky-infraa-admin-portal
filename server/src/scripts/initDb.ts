import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';
import { Owner } from '../models/Owner';
import { Flat } from '../models/Flat';
import { Apartment } from '../models/Apartment';
import dotenv from 'dotenv';

dotenv.config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://abhizgn1026:5nVJkTYWN6d0q3my@cluster0.wzp4ld5.mongodb.net/skyinfraa-panel?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Owner.deleteMany({});
    await Flat.deleteMany({});
    await Apartment.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user with direct password hash
    const adminPassword = 'admin123';
    const admin = await Admin.create({
      email: 'admin@skyinfra.com',
      password: adminPassword, // The pre-save hook will hash this
      name: 'Admin User'
    });
    console.log('👤 Created admin user');

    // Create a sample apartment with required fields
    const apartment = await Apartment.create({
      name: 'Sample Apartment',
      address: '123 Main St',
      units: 3, // Example
      totalFloors: 5, // Added required field
      location: 'Cityville' // Added required field
    });
    console.log('🏗️ Created sample apartment');

    // Create some flats with required fields
    const flats = await Flat.create([
      { 
        flatNumber: 'A-101', 
        apartmentId: apartment._id,
        floor: 1, 
        type: '2BHK', 
        areaSqft: 1000, 
        is_occupied: false 
      },
      { 
        flatNumber: 'A-102', 
        apartmentId: apartment._id,
        floor: 1, 
        type: '3BHK', 
        areaSqft: 1200, 
        is_occupied: false 
      },
      { 
        flatNumber: 'A-103', 
        apartmentId: apartment._id,
        floor: 2, 
        type: '1BHK', 
        areaSqft: 800, 
        is_occupied: false 
      }
    ]);
    console.log('🏢 Created sample flats');

    // Create a sample owner
    const ownerPassword = 'owner123';
    const owner = await Owner.create({
      name: 'John Doe',
      email: 'owner@example.com',
      phone: '1234567890',
      flatId: flats[0]._id,
      password: ownerPassword,
      status: 'active',
      ownershipDate: new Date()
    });
    console.log('👤 Created sample owner');

    // Update flat with owner (The owner creation should handle this linking now)
    // await Flat.findByIdAndUpdate(flats[0]._id, {
    //   is_occupied: true,
    //   owner_id: owner._id
    // });
    console.log('🔗 Linked owner to flat (handled by owner creation)');

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
  }
};

initializeDatabase(); 