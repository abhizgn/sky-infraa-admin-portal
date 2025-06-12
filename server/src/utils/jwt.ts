import jwt from 'jsonwebtoken';
import { IAdminDocument, IOwnerDocument } from '../types';

export const generateToken = (user: IAdminDocument | IOwnerDocument, role: 'admin' | 'owner'): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: role,
      name: user.email || user.name || '',
      flat_no: 'flat_no' in user ? user.flat_no : undefined,
    },
    process.env.JWT_SECRET || 'supersecretkey',
    {
      expiresIn: '7d',
    }
  );
}; 