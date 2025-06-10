import mongoose from 'mongoose';
import { Admin } from '../models/Admin';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://abhizgn1026:5nVJkTYWN6d0q3my@cluster0.wzp4ld5.mongodb.net/skyinfraa-panel?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');

    const admin = await Admin.findOne({ email: 'admin@skyinfra.com' });
    if (admin) {
      console.log('Admin found:', {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        hasPassword: !!admin.password
      });
    } else {
      console.log('Admin not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkAdmin(); 