import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  Store as StoreIcon,
  Logout as LogoutIcon,
  TrendingUp as AnalyticsIcon,
  AttachMoney as RevenueIcon,
  Category as CategoryIcon,
  ShowChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'sales', 'inventory'] },
  { text: 'Products Showcase', icon: <StoreIcon />, path: '/products-showcase', roles: ['admin', 'sales', 'inventory'] },
  { text: 'Product Management', icon: <InventoryIcon />, path: '/products', roles: ['admin', 'inventory'] },
  { text: 'Sales Entry', icon: <SalesIcon />, path: '/sales', roles: ['admin', 'sales'] },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports', roles: ['admin'] },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    path: '/reports/sales-overview',
    roles: ['admin'],
    subItems: [
      { text: 'Sales Overview', icon: <ChartIcon />, path: '/reports/sales-overview' },
      { text: 'Revenue Analysis', icon: <RevenueIcon />, path: '/reports/revenue-analysis' },
      { text: 'Inventory Movement', icon: <InventoryIcon />, path: '/reports/inventory-movement' },
      { text: 'AOV Analysis', icon: <TrendingUpIcon />, path: '/reports/aov-analysis' },
      { text: 'Category Performance', icon: <CategoryIcon />, path: '/reports/category-performance' },
    ]
  },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['admin', 'sales', 'inventory'] },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onMobileToggle();
    }
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const drawerContent = (
    <>
      <Box sx={{ pt: '64px' }} /> {/* Spacer for fixed header */}
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ mt: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: '#1a237e',
            color: 'white',
            top: 0,
            height: '100%',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: '#1a237e',
            color: 'white',
            top: 0,
            height: '100%',
            border: 'none',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar; 