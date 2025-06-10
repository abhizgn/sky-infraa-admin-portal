import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IOwner } from '../types';

export interface IOwnerDocument extends Document {
  flatId: mongoose.Types.ObjectId | null;
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

const ownerSchema = new Schema<IOwnerDocument>({
  flatId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Flat', 
    default: null 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String,
    sparse: true // Make email index sparse to allow null/undefined values
  },
  phone: { 
    type: String, 
    required: true 
  },
  flat_no: { 
    type: String,
    sparse: true // Make flat_no index sparse to allow null/undefined values
  },
  password: { 
    type: String, 
    required: true 
  },
  ownershipDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
}, {
  timestamps: true,
});

// Drop existing indexes
ownerSchema.index({ email: 1 }, { unique: true, sparse: true });
ownerSchema.index({ flat_no: 1 }, { unique: true, sparse: true });

// Hash password before saving
ownerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
ownerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Owner = mongoose.model<IOwnerDocument>('Owner', ownerSchema); 