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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Assessment as ChartIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  ShoppingBag as OrderIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface AOVData {
  currentAOV: number;
  previousAOV: number;
  aovChange: number;
  aovTrend: Array<{ date: string; aov: number }>;
  topCustomersByAOV: Array<{ name: string; totalSpent: number; orders: number; avgOrder: number }>;
  aovByCategory: Array<{ category: string; aov: number; orders: number }>;
  aovByTimeOfDay: Array<{ hour: string; aov: number; orders: number }>;
  aovByDayOfWeek: Array<{ day: string; aov: number; orders: number }>;
  highValueOrders: Array<{ orderId: string; customer: string; amount: number; items: number; date: string }>;
  averageOrderSize: number;
  bestPerformingHour: string;
  bestPerformingDay: string;
}

const AverageOrderValuePage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<AOVData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchAOVData = useCallback(async () => {
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

      const response = await fetch(`/api/reports/aov?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch AOV data');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading AOV data');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchAOVData();
    }
  }, [fetchAOVData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
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
          Average Order Value Analysis
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{
        p: 3,
        mb: 4,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)'
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
              onClick={fetchAOVData}
              fullWidth
              startIcon={<CalendarIcon />}
              sx={{
                background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
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
        🎯 AOV Performance Metrics
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Current AOV</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {formatCurrency(data.currentAOV)}
              </Typography>
              <Chip
                label={`${data.aovChange > 0 ? '+' : ''}${data.aovChange}% vs previous`}
                color={data.aovChange > 0 ? 'success' : 'error'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Previous AOV</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {formatCurrency(data.previousAOV)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <OrderIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Avg Order Size</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {data.averageOrderSize.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Items per order
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Best Day</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {data.bestPerformingDay}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Highest AOV day
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AOV Analysis */}
      <Grid container spacing={3}>
        {/* AOV by Category */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              🏷️ AOV by Category
            </Typography>

            {!data.aovByCategory || data.aovByCategory.length === 0 ? (
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
                    <TableCell align="right" sx={{ fontWeight: 600 }}>AOV</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.aovByCategory.map((category: any, index: number) => (
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
                        {formatCurrency(category.aov)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatNumber(category.orders)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{
                          width: 60,
                          height: 8,
                          bgcolor: category.aov > data.currentAOV ? '#4caf50' : category.aov > data.currentAOV * 0.8 ? '#ff9800' : '#f44336',
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

        {/* Top Customers by AOV */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              👑 Top Customers by AOV
            </Typography>

            {!data.topCustomersByAOV || data.topCustomersByAOV.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  No customer data available
                </Typography>
              </Box>
            ) : (
              <List>
                {data.topCustomersByAOV.slice(0, 8).map((customer: any, index: number) => (
                  <ListItem key={customer.name}>
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
                          {customer.name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Spent: {formatCurrency(customer.totalSpent)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Orders: {formatNumber(customer.orders)} | Avg: {formatCurrency(customer.avgOrder)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Time-based Analysis */}
      <Grid container spacing={3} mt={3}>
        {/* AOV by Day of Week */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              📅 AOV by Day of Week
            </Typography>

            {!data.aovByDayOfWeek || data.aovByDayOfWeek.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 4,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  No day-wise data available
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>AOV</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.aovByDayOfWeek.map((day: any) => (
                    <TableRow key={day.day} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {day.day}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {formatCurrency(day.aov)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {formatNumber(day.orders)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{
                          width: 60,
                          height: 8,
                          bgcolor: day.aov > data.currentAOV ? '#4caf50' : day.aov > data.currentAOV * 0.8 ? '#ff9800' : '#f44336',
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

        {/* High Value Orders */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              💎 High Value Orders
            </Typography>

            {!data.highValueOrders || data.highValueOrders.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 4,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  No high-value orders found
                </Typography>
              </Box>
            ) : (
              <List>
                {data.highValueOrders.slice(0, 5).map((order: any, index: number) => (
                  <ListItem key={order.orderId}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <MoneyIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600} color="success.main">
                          {formatCurrency(order.amount)}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {order.customer} • {order.items} items
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.date).toLocaleDateString()}
                          </Typography>
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

      {/* Summary Footer */}
      <Paper sx={{
        p: 3,
        mt: 4,
        background: 'linear-gradient(135deg, #8e24aa 0%, #7b1fa2 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          💰 AOV Summary
        </Typography>
        <Typography variant="body1">
          From {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()},
          your average order value was {formatCurrency(data.currentAOV)}, representing a {data.aovChange > 0 ? 'positive' : 'negative'} change of {Math.abs(data.aovChange)}% from the previous period.
          The best performing day was {data.bestPerformingDay} with the highest AOV.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AverageOrderValuePage;
