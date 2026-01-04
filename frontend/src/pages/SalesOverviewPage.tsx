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
  IconButton,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as SalesIcon,
  CalendarToday as CalendarIcon,
  Assessment as ChartIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface SalesMetric {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

const SalesOverviewPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchSalesData = useCallback(async () => {
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

      const response = await fetch(`/api/reports/sales?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch sales data');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading sales data');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchSalesData();
    }
  }, [fetchSalesData]);

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

  const salesMetrics: SalesMetric[] = [
    {
      label: 'Total Sales',
      value: formatNumber(data.total || 0),
      change: data.salesChange || 0,
      changeType: (data.salesChange || 0) >= 0 ? 'increase' : 'decrease',
      icon: <SalesIcon sx={{ fontSize: 32 }} />,
      color: '#1976d2'
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(data.totalRevenue || 0),
      change: data.revenueChange || 0,
      changeType: (data.revenueChange || 0) >= 0 ? 'increase' : 'decrease',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: '#43a047'
    },
    {
      label: 'Total Items Sold',
      value: formatNumber(data.totalItems || 0),
      change: data.itemsChange || 0,
      changeType: (data.itemsChange || 0) >= 0 ? 'increase' : 'decrease',
      icon: <ChartIcon sx={{ fontSize: 32 }} />,
      color: '#ff9800'
    },
    {
      label: 'Average Order Value',
      value: formatCurrency(data.averageOrderValue || 0),
      change: data.aovChange || 0,
      changeType: (data.aovChange || 0) >= 0 ? 'increase' : 'decrease',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: '#8e24aa'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={() => navigate('/reports')}
          color="primary"
          sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700} color="primary">
          Sales Overview & Analytics
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{
        p: 3,
        mb: 3,
        backgroundColor: '#f8f9fa'
      }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Filter by Date Range
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2,
          alignItems: 'flex-end'
        }}>
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
          <Button
            variant="contained"
            onClick={fetchSalesData}
            fullWidth
            startIcon={<CalendarIcon />}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Update Data
          </Button>
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Typography variant="h5" fontWeight={600} mb={2} color="text.primary">
        Key Performance Indicators
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        {salesMetrics.map((metric, index) => (
          <Card
            key={index}
            sx={{
              height: 160,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'box-shadow 0.2s, transform 0.2s',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
              }
            }}
            onClick={() => {
              if (metric.label === 'Total Sales') {
                navigate('/reports/total-sales-detail');
              } else if (metric.label === 'Total Revenue') {
                navigate('/reports/total-revenue-detail');
              } else if (metric.label === 'Total Items Sold') {
                navigate('/reports/total-items-detail');
              } else if (metric.label === 'Average Order Value') {
                navigate('/reports/aov-detail');
              }
            }}
          >
            <CardContent sx={{ textAlign: 'center', height: '100%' }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}>
                <Box sx={{
                  bgcolor: metric.color,
                  color: 'white',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40
                }}>
                  {metric.icon}
                </Box>
                {metric.change !== undefined && (
                  <Chip
                    label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                    color={metric.changeType === 'increase' ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="h4" fontWeight={700} color={metric.color} gutterBottom>
                {metric.value}
              </Typography>

              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {metric.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Sales Insights */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 2
      }}>
        {/* Recent Sales */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Recent Sales Activity
          </Typography>

          {!data.sales || data.sales.length === 0 ? (
            <Box sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: '#f9f9f9',
              borderRadius: 1
            }}>
              <Typography color="text.secondary" variant="h6">
                No sales data available
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                Sales will appear here once transactions are recorded
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {data.sales.slice(0, 8).map((sale: any, index: number) => (
                <React.Fragment key={sale._id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Sale #{sale.invoiceNumber || 'N/A'}
                          </Typography>
                          <Chip
                            label={formatCurrency(sale.total || 0)}
                            color="primary"
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Customer: {sale.customer?.name || 'Walk-in'} • Date: {new Date(sale.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })} • Items: {sale.items?.length || 0}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < data.sales.slice(0, 8).length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* Sales Insights */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Sales Insights
          </Typography>

          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Best Performing Metric
              </Typography>
              <Chip
                label="Total Revenue"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sales Trend
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {data.salesTrend === 'up' ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography variant="body2" fontWeight={500}>
                  {data.salesTrend === 'up' ? 'Increasing' : 'Decreasing'} trend
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Peak Sales Day
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {data.peakDay || 'No data available'}
              </Typography>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h6" fontWeight={600} color="primary">
                {formatNumber(data.total || 0)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Summary Footer */}
      <Paper sx={{
        p: 2,
        mt: 3,
        backgroundColor: '#1976d2',
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Sales Summary
        </Typography>
        <Typography variant="body2">
          From {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()},
          your store recorded {formatNumber(data.total || 0)} sales transactions with a total revenue of {formatCurrency(data.totalRevenue || 0)}.
          The average order value was {formatCurrency(data.averageOrderValue || 0)}.
        </Typography>
      </Paper>
    </Container>
  );
};

export default SalesOverviewPage;
