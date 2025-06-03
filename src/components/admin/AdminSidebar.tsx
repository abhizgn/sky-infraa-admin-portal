
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Wrench,
  Receipt,
  AlertTriangle,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  { title: 'Dashboard', url: '/admin', icon: Home },
  { title: 'Apartments', url: '/admin/apartments', icon: Building2 },
  { title: 'Owners', url: '/admin/owners', icon: Users },
  { title: 'Maintenance', url: '/admin/maintenance', icon: Wrench },
  { title: 'Expenses', url: '/admin/expenses', icon: Receipt },
  { title: 'Arrears', url: '/admin/arrears', icon: AlertTriangle },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin' || currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (active: boolean) =>
    active 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={`border-r bg-background transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      collapsible="icon"
    >
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-primary">Sky Infraa</h2>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
          )}
          <SidebarTrigger className="h-8 w-8" />
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={getNavClasses(isActive(item.url))}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t">
            <div className="text-xs text-muted-foreground">
              <p>© 2024 Sky Infraa</p>
              <p>Version 1.0.0</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
