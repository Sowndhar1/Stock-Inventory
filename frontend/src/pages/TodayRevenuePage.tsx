import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, 
  Chip, Alert, CircularProgress, Button, TextField, InputAdornment, 
  IconButton, Tooltip, useTheme, useMediaQuery, Card, CardContent
} from '@mui/material';
import { Search, Refresh, TrendingUp, AttachMoney, BarChart, PieChart, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface Sale {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
  };
  items: Array<{
    product: {
      name: string;
      sku: string;
      price: number;
    };
    quantity: number;
    total: number;
  }>;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

const TodayRevenuePage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0,
    topProducts: [] as Array<{ name: string; revenue: number; quantity: number }>,
    paymentMethods: {} as Record<string, number>,
    hourlyRevenue: [] as Array<{ hour: number; revenue: number }>
  });

  const fetchTodayRevenue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/sales?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      
      // Filter for today's sales
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaySales = data.sales.filter((sale: Sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= today && saleDate < tomorrow;
      });
      
      setSales(todaySales);
      
      // Calculate analytics
      const totalRevenue = todaySales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
      const totalSales = todaySales.length;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      
      // Top products by revenue
      const productRevenue: Record<string, { revenue: number; quantity: number }> = {};
      todaySales.forEach((sale: Sale) => {
        sale.items.forEach((item: any) => {
          const productName = item.product.name;
          if (!productRevenue[productName]) {
            productRevenue[productName] = { revenue: 0, quantity: 0 };
          }
          productRevenue[productName].revenue += item.total;
          productRevenue[productName].quantity += item.quantity;
        });
      });
      
      const topProducts = Object.entries(productRevenue)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Payment methods
      const paymentMethods: Record<string, number> = {};
      todaySales.forEach((sale: Sale) => {
        paymentMethods[sale.paymentMethod] = (paymentMethods[sale.paymentMethod] || 0) + sale.total;
      });
      
      // Hourly revenue
      const hourlyRevenue: Record<number, number> = {};
      todaySales.forEach((sale: Sale) => {
        const hour = new Date(sale.createdAt).getHours();
        hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + sale.total;
      });
      
      const hourlyRevenueArray = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        revenue: hourlyRevenue[hour] || 0
      }));
      
      setAnalytics({
        totalRevenue,
        totalSales,
        averageOrderValue,
        topProducts,
        paymentMethods,
        hourlyRevenue: hourlyRevenueArray
      });
    } catch (err: any) {
      setError(err.message || 'Error loading today\'s revenue');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTodayRevenue();
    }
  }, [fetchTodayRevenue, token]);

  const filteredSales = sales.filter(sale =>
    sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Tooltip title="Back to Dashboard">
          <IconButton 
            onClick={() => navigate('/dashboard')} 
            color="primary"
            sx={{ mr: 2, bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
          >
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" fontWeight={700} color="primary" sx={{ flexGrow: 1 }}>
          Today's Revenue Analytics
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchTodayRevenue} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Revenue Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoney sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  ₹{analytics.totalRevenue.toFixed(2)}
                </Typography>
                <Typography variant="body2">Total Revenue</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  ₹{analytics.averageOrderValue.toFixed(2)}
                </Typography>
                <Typography variant="body2">Average Order</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <BarChart sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {analytics.totalSales}
                </Typography>
                <Typography variant="body2">Total Orders</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Analytics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
        {/* Top Products */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Top Products by Revenue
          </Typography>
          {analytics.topProducts.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No sales recorded today.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {analytics.topProducts.map((product, index) => (
                <Box key={product.name} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      #{index + 1} {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.quantity} units sold
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    ₹{product.revenue.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Payment Methods */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Revenue by Payment Method
          </Typography>
          {Object.keys(analytics.paymentMethods).length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No payment data available.
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {Object.entries(analytics.paymentMethods).map(([method, revenue]) => (
                <Box key={method} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  <Chip 
                    label={method} 
                    size="small"
                    color={method === 'Cash' ? 'success' : 'primary'}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    ₹{revenue.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Search and Actions */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <TextField
          label="Search Today's Sales"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: isMobile ? '100%' : 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button 
          variant="contained" 
          onClick={() => navigate('/sales')}
        >
          View All Sales
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sales Table */}
      <Paper sx={{ overflow: 'auto' }}>
        <Typography variant="h6" fontWeight={600} sx={{ p: 3, pb: 1 }}>
          Today's Sales Details
        </Typography>
        {filteredSales.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm ? 'No sales found matching your search.' : 'No sales recorded today.'}
            </Typography>
            {!searchTerm && (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/sales')}
              >
                Create Your First Sale
              </Button>
            )}
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Invoice</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Items</strong></TableCell>
                <TableCell><strong>Revenue</strong></TableCell>
                <TableCell><strong>Payment</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale._id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {sale.invoiceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {sale.customer.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.items.length} items
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      ₹{sale.total.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={sale.paymentMethod} 
                      size="small"
                      color={sale.paymentMethod === 'Cash' ? 'success' : 'primary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(sale.createdAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default TodayRevenuePage; 