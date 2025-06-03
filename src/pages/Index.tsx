
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Shield, Smartphone } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  // Auto-redirect to admin dashboard for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/admin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Building2 className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">Sky Infraa</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete Apartment Management System for Modern Living
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Redirecting to Admin Portal in 3 seconds...
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Admin Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Complete management dashboard for apartment operations</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Owner Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Personalized portal for apartment owners</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Smartphone className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Mobile App</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">On-the-go access for residents and staff</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
            <CardHeader>
              <Building2 className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Smart Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Automated billing, payments, and notifications</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Buttons */}
        <div className="text-center space-x-4">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/admin')}
          >
            <Shield className="h-5 w-5 mr-2" />
            Admin Portal
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate('/admin')}
          >
            <Users className="h-5 w-5 mr-2" />
            Owner Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
