// This is a mock API for development purposes
interface MockAdmin {
  email: string;
  password: string;
}

interface MockOwner {
  email: string;
  password: string;
  flat_no: string;
}

const mockUsers = {
  admin: {
    email: 'admin@skyinfra.com',
    password: 'admin123', // In real app, this would be hashed
  } as MockAdmin,
  owner: {
    email: 'owner@example.com',
    password: 'owner123',
    flat_no: 'A-101',
  } as MockOwner,
};

const mockFlats = [
  { id: '1', flat_no: 'A-101' },
  { id: '2', flat_no: 'A-102' },
  { id: '3', flat_no: 'A-103' },
];

export const mockApi = {
  login: async (email: string, password: string, role: 'admin' | 'owner') => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers[role];
    if (user.email === email && user.password === password) {
      return {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          role,
          name: role === 'admin' ? 'Admin User' : 'Owner User',
          flat_no: role === 'owner' ? (user as MockOwner).flat_no : undefined,
        },
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      token: 'mock-jwt-token',
      user: {
        id: '2',
        role: 'owner' as const,
        ...userData,
      },
    };
  },

  getAvailableFlats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFlats;
  },

  validateToken: async (_token: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: '1',
      role: 'admin' as const,
      name: 'Admin User',
    };
  },
}; 