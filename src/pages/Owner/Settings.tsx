
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Home, 
  User, 
  Edit3, 
  Save, 
  LogOut, 
  Bell, 
  Shield, 
  AlertTriangle,
  Phone,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const OwnerSettings = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Mock data - in real app this would come from API
  const [ownerData, setOwnerData] = useState({
    name: "Rajesh Kumar",
    flatNumber: "A-101",
    email: "rajesh@email.com",
    phone: "+91 9876543210",
    joinDate: "2023-01-15"
  });

  const [editData, setEditData] = useState({
    email: ownerData.email,
    phone: ownerData.phone,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    arrearNotifications: true,
    maintenanceUpdates: false
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditData({
        email: ownerData.email,
        phone: ownerData.phone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    
    // Validation
    if (isChangingPassword) {
      if (editData.newPassword !== editData.confirmPassword) {
        toast.error("New passwords don't match");
        setSaving(false);
        return;
      }
      if (editData.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        setSaving(false);
        return;
      }
    }

    // Simulate API call
    setTimeout(() => {
      setOwnerData(prev => ({
        ...prev,
        email: editData.email,
        phone: editData.phone
      }));
      
      setIsEditing(false);
      setIsChangingPassword(false);
      setSaving(false);
      toast.success("Settings updated successfully!");
    }, 1000);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    // Auto-save notification preferences
    toast.success("Notification preference updated");
  };

  const handleLogout = () => {
    // Clear any stored tokens/session data
    localStorage.clear();
    sessionStorage.clear();
    
    toast.success("Logged out successfully");
    navigate('/');
  };

  const handleDeactivateAccount = () => {
    setShowDeactivateModal(false);
    toast.success("Account deactivation request submitted for review");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Owner Portal</h1>
            </div>
            <nav className="flex space-x-6">
              <Button variant="ghost" onClick={() => navigate('/owner')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/bills')}>My Bills</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/pay-now')}>Pay Now</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/arrears')}>Arrears</Button>
              <Button variant="ghost" className="text-blue-600 bg-blue-50">Settings</Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/owner')} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 animate-fade-in">Account Settings</h2>
              <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Manage your personal details</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditToggle}
                    disabled={isSaving}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Non-editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Owner Name</Label>
                    <p className="font-medium text-gray-900 mt-1">{ownerData.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Flat Number</Label>
                    <p className="font-medium text-gray-900 mt-1">{ownerData.flatNumber}</p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 mt-1">{ownerData.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        className="mt-1 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 mt-1">{ownerData.phone}</p>
                    )}
                  </div>
                </div>

                {/* Password Change Section */}
                {isEditing && (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="flex items-center text-base font-medium">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Label>
                      <Switch
                        checked={isChangingPassword}
                        onCheckedChange={setIsChangingPassword}
                      />
                    </div>
                    
                    {isChangingPassword && (
                      <div className="space-y-4 animate-fade-in">
                        <Input
                          type="password"
                          placeholder="Current Password"
                          value={editData.currentPassword}
                          onChange={(e) => setEditData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                        <Input
                          type="password"
                          placeholder="New Password"
                          value={editData.newPassword}
                          onChange={(e) => setEditData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                        <Input
                          type="password"
                          placeholder="Confirm New Password"
                          value={editData.confirmPassword}
                          onChange={(e) => setEditData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="hover-scale"
                    >
                      {isSaving ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Info & Actions */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                  <p className="font-medium">
                    {new Date(ownerData.joinDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="destructive" 
                  className="w-full hover-scale"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeactivateModal(true)}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Deactivate Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Notification Preferences */}
        <Card className="mt-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Control how you receive updates about bills and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Reminders</Label>
                    <p className="text-sm text-gray-600">Bill due date notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailReminders}
                    onCheckedChange={(checked) => handleNotificationChange('emailReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">SMS Reminders</Label>
                    <p className="text-sm text-gray-600">Bill due date notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) => handleNotificationChange('smsReminders', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Arrear Notifications</Label>
                    <p className="text-sm text-gray-600">Alerts for overdue payments</p>
                  </div>
                  <Switch
                    checked={notifications.arrearNotifications}
                    onCheckedChange={(checked) => handleNotificationChange('arrearNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Maintenance Updates</Label>
                    <p className="text-sm text-gray-600">Society maintenance and events</p>
                  </div>
                  <Switch
                    checked={notifications.maintenanceUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('maintenanceUpdates', checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deactivate Account Modal */}
        {showDeactivateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <Card className="max-w-md mx-4 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Deactivate Account
                </CardTitle>
                <CardDescription>
                  This action will request account deactivation. Admin approval is required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <strong>Warning:</strong> Deactivating your account will prevent access to the portal. 
                    Make sure all dues are cleared before deactivation.
                  </AlertDescription>
                </Alert>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeactivateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeactivateAccount}
                    className="flex-1"
                  >
                    Request Deactivation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerSettings;
