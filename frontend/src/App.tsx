import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, CssBaseline, Container, IconButton, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import Sidebar from './components/Sidebar.tsx';
import LoginPage from './pages/LoginPage.tsx';
import SignupPage from './pages/SignupPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('./pages/DashboardPage.tsx'));
const ProductManagementPage = lazy(() => import('./pages/ProductManagementPage.tsx'));
const SalesEntryPage = lazy(() => import('./pages/SalesEntryPage.tsx'));
const ReportsPage = lazy(() => import('./pages/ReportsPage.tsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.tsx'));
const ProductsShowcase = lazy(() => import('./pages/ProductsShowcase.tsx'));

    {/* Detailed Report Pages */}
    const SalesOverviewPage = lazy(() => import('./pages/SalesOverviewPage.tsx'));
    const RevenueAnalysisPage = lazy(() => import('./pages/RevenueAnalysisPage.tsx'));
    const InventoryMovementPage = lazy(() => import('./pages/InventoryMovementPage.tsx'));
    const AverageOrderValuePage = lazy(() => import('./pages/AverageOrderValuePage.tsx'));
    const CategoryPerformancePage = lazy(() => import('./pages/CategoryPerformancePage.tsx'));
    const TotalSalesDetailPage = lazy(() => import('./pages/TotalSalesDetailPage.tsx'));
    const TotalRevenueDetailPage = lazy(() => import('./pages/TotalRevenueDetailPage.tsx'));
    const TotalItemsDetailPage = lazy(() => import('./pages/TotalItemsDetailPage.tsx'));
    const AOVDetailPage = lazy(() => import('./pages/AOVDetailPage.tsx'));

// Dedicated dashboard card pages
const LowStockPage = lazy(() => import('./pages/LowStockPage.tsx'));
const TodaySalesPage = lazy(() => import('./pages/TodaySalesPage.tsx'));
const TodayRevenuePage = lazy(() => import('./pages/TodayRevenuePage.tsx'));
// Loading component
const PageLoader: React.FC = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '50vh' 
  }}>
    <CircularProgress size={40} />
  </Box>
);

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileToggle={handleDrawerToggle} />
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: { xs: '100%', md: `calc(100% - 240px)` },
        ml: { xs: 0, md: '240px' }
      }}>
        <AppBar 
          position="fixed" 
          color="primary" 
          enableColorOnDark 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: { xs: '100%', md: `calc(100% - 240px)` },
            ml: { xs: 0, md: '240px' }
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
              {user?.storeName || 'APPAREL STOCK TRACKER'}
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            bgcolor: '#f5f6fa', 
            pt: { xs: '64px', md: '64px' },
            minHeight: '100vh',
            width: '100%'
          }}
        >
          <Container 
            maxWidth="xl" 
            sx={{ 
              py: { xs: 2, md: 4 }, 
              px: { xs: 2, md: 4 },
              width: '100%',
              mx: 'auto'
            }}
          >
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductManagementPage />} />
                <Route path="/products-showcase" element={<ProductsShowcase />} />
                <Route path="/sales" element={<SalesEntryPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/reports/sales-overview" element={<SalesOverviewPage />} />
                <Route path="/reports/revenue-analysis" element={<RevenueAnalysisPage />} />
                <Route path="/reports/inventory-movement" element={<InventoryMovementPage />} />
                <Route path="/reports/aov-analysis" element={<AverageOrderValuePage />} />
                <Route path="/reports/total-sales-detail" element={<TotalSalesDetailPage />} />
                <Route path="/reports/total-revenue-detail" element={<TotalRevenueDetailPage />} />
                <Route path="/reports/total-items-detail" element={<TotalItemsDetailPage />} />
                <Route path="/reports/aov-detail" element={<AOVDetailPage />} />

                {/* Dedicated dashboard card pages */}
                <Route path="/low-stock" element={<LowStockPage />} />
                <Route path="/today-sales" element={<TodaySalesPage />} />
                <Route path="/today-revenue" element={<TodayRevenuePage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
