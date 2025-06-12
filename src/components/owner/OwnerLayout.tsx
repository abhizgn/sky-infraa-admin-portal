import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Receipt, DollarSign, Settings, AlertCircle, LogOut } from 'lucide-react'; // Removed BellRing
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Assuming you have an Avatar component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/AuthContext'; // Assuming you have an AuthContext

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export const OwnerLayout: React.FC<OwnerLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth(); // Get logout and user from AuthContext
  const navigate = useNavigate(); // Add this line to get the navigate function
  const location = useLocation(); // Use useLocation to get current path

  const navigation = [
    { name: 'Dashboard', href: '/owner/dashboard', icon: Home },
    { name: 'My Bills', href: '/owner/bills', icon: Receipt },
    { name: 'Pay Now', href: '/owner/pay', icon: DollarSign }, // Update this if your pay route is /owner/pay-now
    { name: 'Arrears', href: '/owner/arrears', icon: AlertCircle },
    { name: 'Settings', href: '/owner/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Optionally clear user state from context/store
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link to="/owner/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
            <span className="sr-only">Sky Infraa Owner Portal</span>
            Sky Infraa
          </Link>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-muted-foreground transition-colors hover:text-foreground ${
                location.pathname === item.href ? 'text-foreground' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link to="/owner/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                <span className="sr-only">Sky Infraa Owner Portal</span>
                Sky Infraa
              </Link>
              {navigation.map((item) => (
                <Link key={item.name} to={item.href} className="hover:text-foreground">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
          {/* Add search, notifications if needed */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" /> {/* Replace with actual owner avatar */}
                  <AvatarFallback>{user?.name ? user.name[0] : 'O'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => alert('Profile Clicked')}>Profile</DropdownMenuItem> {/* Replace with actual profile route */}
              <DropdownMenuItem onClick={() => navigate('/owner/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        {children}
      </main>
    </div>
  );
}; 