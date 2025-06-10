import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import adminOwners from './routes/adminOwners';
import adminBills from './routes/adminBills';
import adminExpenses from './routes/adminExpense';
import maintenanceRoutes from './routes/adminMaintenance';
import adminFlatsRoutes from './routes/adminFlats';
import adminArrearsRoutes from './routes/adminArrears';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`); // Debug log
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/owners', adminOwners);
app.use('/api/admin/bills', adminBills);
app.use('/api/admin/expenses', adminExpenses);
app.use('/api/admin/maintenance', maintenanceRoutes);
app.use('/api/admin/flats', adminFlatsRoutes);
app.use('/api/admin/arrears', adminArrearsRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb+srv://abhizgn1026:5nVJkTYWN6d0q3my@cluster0.wzp4ld5.mongodb.net/skyinfraa-panel?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    // Drop problematic indexes on startup
    try {
      // Drop flat_no_1 index for flats collection
      await mongoose.connection.db.collection('flats').dropIndex('flat_no_1');
      console.log('Dropped problematic flat_no_1 index from flats collection');
    } catch (error) {
      // Ignore error if index doesn't exist
      console.log('No problematic flat_no_1 index to drop from flats collection');
    }

    try {
      // Drop flat_no_1 index for owners collection
      await mongoose.connection.db.collection('owners').dropIndex('flat_no_1');
      console.log('Dropped problematic flat_no_1 index from owners collection');
    } catch (error) {
      // Ignore error if index doesn't exist
      console.log('No problematic flat_no_1 index to drop from owners collection');
    }
  })
  .catch(err => console.error('❌ Mongo Error:', err));

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 