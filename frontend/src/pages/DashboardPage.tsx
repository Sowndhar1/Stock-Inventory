import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, useTheme, useMediaQuery, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaleDetailsModal from '../components/SaleDetailsModal.tsx';

interface StatData {
  totalProducts: number;
  lowStockProducts: number;
  todaySales: number;
  todayRevenue: number;
  monthlySales: number;
  monthlyRevenue: number;
  recentSales: any[];
}

const StatCard: React.FC<{
  label: string;
  value: string | number;
  color?: string;
  onClick?: () => void;
  clickable?: boolean;
}> = ({ label, value, color, onClick, clickable = false }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: clickable ? 'pointer' : 'default',
      height: '100%',
      '&:hover': clickable ? {
        '& .stat-card': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
          bgcolor: color ? `${color}dd` : 'grey.100'
        }
      } : {}
    }}
  >
    <Paper
      className="stat-card"
      sx={{
        bgcolor: color || 'white',
        color: color ? 'white' : 'primary.main',
        borderRadius: 2,
        p: 3,
        minWidth: 120,
        textAlign: 'center',
        boxShadow: 2,
        fontWeight: 600,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{value}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        {label}
        {clickable && (
          <Box component="span" sx={{ ml: 1, fontSize: '0.8em', opacity: 0.7 }}>
            →
          </Box>
        )}
      </Typography>
    </Paper>
  </Box>
);

const DashboardPage: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [saleDetailsOpen, setSaleDetailsOpen] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const res = await fetch('/api/reports/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStats();
      // Poll every 30 seconds instead of 10 to reduce server load
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchStats, token]);

  if (loading && !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          color="primary"
          sx={{
            flexGrow: 1,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              opacity: 0.8,
              transform: 'scale(1.02)'
            }
          }}
          onClick={() => fetchStats(true)}
        >
          Dashboard
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => fetchStats(true)} color="primary" disabled={refreshing}>
            <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Quick Summary */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: 'primary.light',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: 'primary.main',
            transform: 'translateY(-1px)',
            boxShadow: 3
          }
        }}
        onClick={() => navigate('/reports')}
      >
        <Typography variant="body1" sx={{ textAlign: 'center' }}>
          <strong>Today's Summary:</strong> {stats.todaySales} sales • ₹{stats.todayRevenue.toFixed(2)} revenue • {stats.lowStockProducts} items need restocking
          <Box component="span" sx={{ ml: 1, fontSize: '0.9em', opacity: 0.8 }}>
            (Click to view detailed reports)
          </Box>
        </Typography>
      </Paper>

      {/* Statistics Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        {/* Total Products Card */}
        <StatCard
          label="Total Products"
          value={stats.totalProducts}
          clickable={true}
          onClick={() => navigate('/products')}
        />

        {/* Low Stock Items Card */}
        <StatCard
          label="Low Stock Items"
          value={stats.lowStockProducts}
          color={stats.lowStockProducts > 0 ? "#e53935" : "#43a047"}
          clickable={true}
          onClick={() => navigate('/low-stock')}
        />

        {/* Today's Sales Card */}
        <StatCard
          label="Today's Sales"
          value={stats.todaySales}
          color="#43a047"
          clickable={true}
          onClick={() => navigate('/today-sales')}
        />

        {/* Today's Revenue Card */}
        <StatCard
          label="Today's Revenue"
          value={`₹${stats.todayRevenue.toFixed(2)}`}
          color="#1976d2"
          clickable={true}
          onClick={() => navigate('/today-revenue')}
        />

        {/* Monthly Sales Card */}
        <StatCard
          label="Monthly Sales"
          value={stats.monthlySales}
          color="#8e24aa"
          clickable={true}
          onClick={() => navigate('/reports')}
        />

        {/* Monthly Revenue Card */}
        <StatCard
          label="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toFixed(2)}`}
          color="#fbc02d"
          clickable={true}
          onClick={() => navigate('/reports')}
        />
      </Box>

      {/* Recent Sales */}
      <Paper sx={{ p: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Sales
          </Typography>
          <Link to="/reports" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              View All Sales →
            </Typography>
          </Link>
        </Box>
        {stats.recentSales.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No recent sales.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/sales')}
              sx={{ mt: 1 }}
            >
              Create Your First Sale
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {stats.recentSales.map((sale, idx) => (
              <Box
                key={sale._id || idx}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)',
                    borderColor: 'primary.main',
                    bgcolor: 'grey.50'
                  }
                }}
                onClick={() => {
                  setSelectedSaleId(sale._id);
                  setSaleDetailsOpen(true);
                }}
              >
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 1
                }}>
                  <Typography variant="body2">
                    <strong>Invoice:</strong> {sale.invoiceNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Customer:</strong> {sale.customer?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total:</strong> ₹{sale.total?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {new Date(sale.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Time:</strong> {new Date(sale.createdAt).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontStyle: 'italic', mt: 1 }}>
                    Click to view details →
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Sale Details Modal */}
      <SaleDetailsModal
        open={saleDetailsOpen}
        onClose={() => setSaleDetailsOpen(false)}
        saleId={selectedSaleId}
      />
    </Box>
  );
};

export default DashboardPage; 