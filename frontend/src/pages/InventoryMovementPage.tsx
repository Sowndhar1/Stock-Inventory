import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  useTheme,
  useMediaQuery,
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as CartIcon,
  CalendarToday as CalendarIcon,
  Assessment as ChartIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface InventoryData {
  totalItemsSold: number;
  itemsByCategory: Array<{ category: string; sold: number; percentage: number }>;
  topSellingProducts: Array<{ name: string; sold: number; revenue: number; stockLeft: number }>;
  lowStockItems: Array<{ name: string; sold: number; stockLeft: number }>;
  outOfStockItems: Array<{ name: string; sold: number; lastSold: string }>;
  dailySalesTrend: Array<{ date: string; items: number }>;
  averageItemsPerSale: number;
  itemsSoldChange: number;
}

const InventoryMovementPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<InventoryData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate.toISOString().split('T')[0]);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`/api/reports/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch inventory data');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading inventory data');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchInventoryData();
    }
  }, [fetchInventoryData]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'error';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  const getStockStatusIcon = (stock: number) => {
    if (stock === 0) return <WarningIcon />;
    if (stock <= 5) return <WarningIcon />;
    return <CheckIcon />;
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh'
        }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 4,
        gap: 2
      }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/reports')}
          variant="outlined"
          sx={{ minWidth: 'auto', p: 1 }}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={700} color="primary">
          Inventory Movement Analysis
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{
        p: 3,
        mb: 4,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #fff3e0 100%)'
      }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          📅 Filter by Date Range
        </Typography>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={4}>
            <TextField
              label="Start Date"
              type="date"
              value={dateRange.startDate.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                startDate: new Date(e.target.value)
              }))}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="End Date"
              type="date"
              value={dateRange.endDate.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                endDate: new Date(e.target.value)
              }))}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={fetchInventoryData}
              fullWidth
              startIcon={<CalendarIcon />}
              sx={{
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                }
              }}
            >
              Update Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Key Metrics */}
      <Typography variant="h5" fontWeight={600} mb={3} color="text.primary">
        🎯 Inventory Performance Metrics
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Items Sold</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {formatNumber(data.totalItemsSold)}
              </Typography>
              <Chip
                label={`${data.itemsSoldChange > 0 ? '+' : ''}${data.itemsSoldChange}% change`}
                color={data.itemsSoldChange > 0 ? 'success' : 'error'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CartIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Avg per Sale</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {data.averageItemsPerSale.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Items per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Low Stock</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {data.lowStockItems?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Items need restock
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #795548 0%, #5d4037 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Out of Stock</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {data.outOfStockItems?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Unavailable items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Analysis */}
      <Grid container spacing={3}>
        {/* Items by Category */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              🏷️ Items Sold by Category
            </Typography>

            {!data.itemsByCategory || data.itemsByCategory.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  No category data available
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Items Sold</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.itemsByCategory.map((category: any, index: number) => (
                    <TableRow key={category.category} hover>
                      <TableCell>
                        <Chip
                          label={category.category}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatNumber(category.sold)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {category.percentage}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{
                          width: 60,
                          height: 8,
                          bgcolor: category.percentage > 30 ? '#4caf50' : category.percentage > 15 ? '#ff9800' : '#f44336',
                          borderRadius: 4
                        }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        {/* Top Selling Products */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              🏆 Top Selling Products
            </Typography>

            {!data.topSellingProducts || data.topSellingProducts.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  No product data available
                </Typography>
              </Box>
            ) : (
              <List>
                {data.topSellingProducts.slice(0, 8).map((product: any, index: number) => (
                  <ListItem key={product.name}>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: index === 0 ? 'warning.main' : index === 1 ? 'grey.400' : 'grey.300',
                        color: index < 2 ? 'white' : 'text.primary'
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {product.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Sold: {formatNumber(product.sold)} | Revenue: {formatCurrency(product.revenue)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip
                              label={`${product.stockLeft} left`}
                              color={getStockStatusColor(product.stockLeft)}
                              size="small"
                              icon={getStockStatusIcon(product.stockLeft)}
                            />
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Stock Alerts */}
      <Grid container spacing={3} mt={3}>
        {/* Low Stock Items */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="warning.main">
              ⚠️ Low Stock Alert
            </Typography>

            {!data.lowStockItems || data.lowStockItems.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 4,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography color="success.main" variant="h6">
                  All items are well stocked!
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  No low stock items found
                </Typography>
              </Box>
            ) : (
              <List>
                {data.lowStockItems.map((item: any, index: number) => (
                  <ListItem key={item.name}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <WarningIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600} color="warning.main">
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Stock left: {item.stockLeft} | Total sold: {formatNumber(item.sold)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Out of Stock Items */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="error.main">
              🚫 Out of Stock Items
            </Typography>

            {!data.outOfStockItems || data.outOfStockItems.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 4,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography color="success.main" variant="h6">
                  Excellent inventory management!
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  No out of stock items
                </Typography>
              </Box>
            ) : (
              <List>
                {data.outOfStockItems.map((item: any, index: number) => (
                  <ListItem key={item.name}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <WarningIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600} color="error.main">
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Last sold: {new Date(item.lastSold).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Summary Footer */}
      <Paper sx={{
        p: 3,
        mt: 4,
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          📦 Inventory Summary
        </Typography>
        <Typography variant="body1">
          From {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()},
          {formatNumber(data.totalItemsSold)} items were sold across {data.itemsByCategory?.length || 0} categories.
          The average items per sale was {data.averageItemsPerSale.toFixed(1)}.
          {data.lowStockItems?.length > 0 && ` ${data.lowStockItems.length} items are running low on stock.`}
          {data.outOfStockItems?.length > 0 && ` ${data.outOfStockItems.length} items are currently out of stock.`}
        </Typography>
      </Paper>
    </Container>
  );
};

export default InventoryMovementPage;
