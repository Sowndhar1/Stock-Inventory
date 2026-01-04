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
  AttachMoney as RevenueIcon,
  CalendarToday as CalendarIcon,
  Assessment as ChartIcon,
  ArrowBack as ArrowBackIcon,
  ShowChart as GrowthIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface RevenueData {
  dailyRevenue: Array<{ date: string; amount: number }>;
  weeklyRevenue: Array<{ week: string; amount: number }>;
  monthlyRevenue: Array<{ month: string; amount: number }>;
  topProducts: Array<{ name: string; revenue: number; quantity: number }>;
  revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>;
  totalRevenue: number;
  averageDailyRevenue: number;
  bestDay: string;
  worstDay: string;
  growthRate: number;
}

const RevenueAnalysisPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<RevenueData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchRevenueData = useCallback(async () => {
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

      const response = await fetch(`/api/reports/revenue?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch revenue data');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading revenue data');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchRevenueData();
    }
  }, [fetchRevenueData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
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
          Revenue Analysis & Insights
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{
        p: 3,
        mb: 4,
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)'
      }}>
        <Typography variant="h6" fontWeight={600} mb={3}>
          Filter by Date Range
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
              onClick={fetchRevenueData}
              fullWidth
              startIcon={<CalendarIcon />}
              sx={{
                background: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
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
        🎯 Revenue Performance Metrics
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RevenueIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {formatCurrency(data.totalRevenue)}
              </Typography>
              <Chip
                label={`${data.growthRate > 0 ? '+' : ''}${data.growthRate}% growth`}
                color={data.growthRate > 0 ? 'success' : 'error'}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
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
                <TrendingUpIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Daily Average</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {formatCurrency(data.averageDailyRevenue)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Per day revenue
              </Typography>
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
                <GrowthIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Best Day</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {data.bestDay}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Highest revenue day
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
                <TrendingDownIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Slow Day</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {data.worstDay}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Lowest revenue day
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Breakdown */}
      <Grid container spacing={3}>
        {/* Revenue by Category */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              🏷️ Revenue by Category
            </Typography>

            {!data.revenueByCategory || data.revenueByCategory.length === 0 ? (
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
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.revenueByCategory.map((category: any, index: number) => (
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
                        {formatCurrency(category.revenue)}
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
                          bgcolor: category.percentage > 20 ? '#4caf50' : category.percentage > 10 ? '#ff9800' : '#f44336',
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

        {/* Top Products */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              🏆 Top Revenue Products
            </Typography>

            {!data.topProducts || data.topProducts.length === 0 ? (
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
                {data.topProducts.slice(0, 8).map((product: any, index: number) => (
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
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Revenue: {formatCurrency(product.revenue)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty Sold: {product.quantity}
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

      {/* Revenue Trends */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={3} color="primary">
          📈 Revenue Trends & Patterns
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  Growth Rate
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {data.growthRate > 0 ? '+' : ''}{data.growthRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Compared to previous period
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  Peak Performance
                </Typography>
                <Typography variant="h6" fontWeight={700} color="warning.main">
                  {data.bestDay}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Best revenue day
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.main">
                  Improvement Needed
                </Typography>
                <Typography variant="h6" fontWeight={700} color="error.main">
                  {data.worstDay}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lowest revenue day
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Footer */}
      <Paper sx={{
        p: 3,
        mt: 4,
        background: 'linear-gradient(135deg, #43a047 0%, #388e3c 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          💰 Revenue Summary
        </Typography>
        <Typography variant="body1">
          From {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()},
          your store generated {formatCurrency(data.totalRevenue)} in revenue with an average daily revenue of {formatCurrency(data.averageDailyRevenue)}.
          The revenue grew by {data.growthRate > 0 ? '+' : ''}{data.growthRate}% compared to the previous period.
        </Typography>
      </Paper>
    </Container>
  );
};

export default RevenueAnalysisPage;
