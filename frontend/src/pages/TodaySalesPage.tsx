import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, 
  Chip, Alert, CircularProgress, Button, TextField, InputAdornment, 
  IconButton, Tooltip, useTheme, useMediaQuery, Grid, Card, CardContent
} from '@mui/material';
import { Search, Refresh, Add, TrendingUp, AttachMoney, ShoppingCart, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface Sale {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
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
  soldBy: {
    username: string;
  };
}

const TodaySalesPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItems: 0
  });

  const fetchTodaySales = useCallback(async () => {
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
      
      // Calculate stats
      const totalRevenue = todaySales.reduce((sum: number, sale: Sale) => sum + sale.total, 0);
      const totalItems = todaySales.reduce((sum: number, sale: Sale) => 
        sum + sale.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
      );
      
      setStats({
        totalSales: todaySales.length,
        totalRevenue,
        averageOrderValue: todaySales.length > 0 ? totalRevenue / todaySales.length : 0,
        totalItems
      });
    } catch (err: any) {
      setError(err.message || 'Error loading today\'s sales');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTodaySales();
    }
  }, [fetchTodaySales, token]);

  const filteredSales = sales.filter(sale =>
    sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.soldBy.username.toLowerCase().includes(searchTerm.toLowerCase())
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
          Today's Sales
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchTodaySales} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShoppingCart sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalSales}
                </Typography>
                <Typography variant="body2">Total Sales</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoney sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  ₹{stats.totalRevenue.toFixed(2)}
                </Typography>
                <Typography variant="body2">Total Revenue</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUp sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  ₹{stats.averageOrderValue.toFixed(2)}
                </Typography>
                <Typography variant="body2">Average Order</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ShoppingCart sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalItems}
                </Typography>
                <Typography variant="body2">Items Sold</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
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
          startIcon={<Add />}
          onClick={() => navigate('/sales')}
        >
          Create New Sale
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Sales Table */}
      <Paper sx={{ overflow: 'auto' }}>
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
                <TableCell><strong>Total</strong></TableCell>
                <TableCell><strong>Payment</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>Sold By</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
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
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {sale.customer.name}
                      </Typography>
                      {sale.customer.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {sale.customer.phone}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.items.length} items
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)} total qty
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
                  <TableCell>
                    <Typography variant="body2">
                      {sale.soldBy.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => navigate(`/sales?saleId=${sale._id}`)}
                    >
                      View
                    </Button>
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

export default TodaySalesPage; 