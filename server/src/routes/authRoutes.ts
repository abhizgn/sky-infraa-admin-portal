import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin';
import { Owner } from '../models/Owner';
import { generateToken } from '../utils/jwt';
import { verifyToken, adminOnly, ownerOnly } from '../middleware/authMiddleware';

// Define the custom request type that includes the user property
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'owner';
    name: string;
    flat_no?: string;
  };
}

const router = Router();

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Don't log password

    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Admin found:', { id: admin._id, email: admin.email });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful');

    const token = generateToken(admin, 'admin');
    res.json({
      token,
      user: {
        id: admin._id,
        role: 'admin',
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Owner Login
router.post('/owner/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner || !(await owner.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(owner, 'owner');
    res.json({
      token,
      user: {
        id: owner._id,
        role: 'owner',
        name: owner.name,
        flat_no: owner.flat_no
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Owner Register
router.post('/owner/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, flat_no, password } = req.body;
    
    // Check if email or flat_no already exists
    const existing = await Owner.findOne({ 
      $or: [{ email }, { flat_no }] 
    });
    
    if (existing) {
      return res.status(409).json({ 
        message: 'Email or Flat already assigned' 
      });
    }

    const owner = new Owner({ 
      name, 
      email, 
      phone, 
      flat_no, 
      password 
    });
    
    await owner.save();
    const token = generateToken(owner, 'owner');
    
    res.status(201).json({ 
      token,
      user: {
        id: owner._id,
        role: 'owner',
        name: owner.name,
        flat_no: owner.flat_no
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user!;
    
    if (role === 'admin') {
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      return res.json({
        id: admin._id,
        role: 'admin',
        name: admin.email
      });
    } else {
      const owner = await Owner.findById(id);
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
      }
      return res.json({
        id: owner._id,
        role: 'owner',
        name: owner.name,
        flat_no: owner.flat_no
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 