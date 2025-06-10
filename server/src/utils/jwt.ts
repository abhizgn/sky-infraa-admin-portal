import jwt from 'jsonwebtoken';
import { IAdmin, IOwner } from '../types';

export const generateToken = (user: IAdmin | IOwner, role: 'admin' | 'owner'): string => {
  return jwt.sign(
    {
      id: user._id,
      role: role,
      name: user.email || '',
      flat_no: 'flat_no' in user ? user.flat_no : undefined,
    },
    process.env.JWT_SECRET || 'supersecretkey',
    {
      expiresIn: '7d',
    }
  );
}; 