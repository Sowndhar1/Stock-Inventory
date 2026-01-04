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
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  Assessment as ChartIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface CategoryData {
  topCategory: string;
  categoryPerformance: Array<{
    category: string;
    sales: number;
    revenue: number;
    orders: number;
    avgOrderValue: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  categoryTrends: Array<{
    category: string;
    data: Array<{ date: string; sales: number; revenue: number }>;
  }>;
  bestPerformingCategory: {
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  };
  worstPerformingCategory: {
    name: string;
    sales: number;
    revenue: number;
    growth: number;
  };
  categoryDistribution: Array<{
    category: string;
    percentage: number;
    color: string;
  }>;
  emergingCategories: Array<{
    category: string;
    growth: number;
    potential: string;
  }>;
}

const CategoryPerformancePage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<CategoryData | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchCategoryData = useCallback(async () => {
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

      const response = await fetch(`/api/reports/categories?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch category data');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading category data');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchCategoryData();
    }
  }, [fetchCategoryData]);

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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success.main';
      case 'down': return 'error.main';
      default: return 'warning.main';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon />;
      case 'down': return <TrendingDownIcon />;
      default: return <ChartIcon />;
    }
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
          🏆 Category Performance Analysis
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
              onClick={fetchCategoryData}
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

      {/* Top Category Highlight */}
      <Paper sx={{
        p: 3,
        mb: 4,
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              🏆 Top Performing Category
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {data.bestPerformingCategory?.name || 'No data available'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {formatNumber(data.bestPerformingCategory?.sales || 0)} sales • {formatCurrency(data.bestPerformingCategory?.revenue || 0)} revenue
            </Typography>
          </Box>
          <TrophyIcon sx={{ fontSize: 64, opacity: 0.8 }} />
        </Box>
      </Paper>

      {/* Key Metrics */}
      <Typography variant="h5" fontWeight={600} mb={3} color="text.primary">
        🎯 Category Performance Metrics
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrophyIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Best Category</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {data.bestPerformingCategory?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                +{data.bestPerformingCategory?.growth || 0}% growth
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
                <Typography variant="h6">Needs Attention</Typography>
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {data.worstPerformingCategory?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {data.worstPerformingCategory?.growth || 0}% growth
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
                <CategoryIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Total Categories</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {data.categoryPerformance?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Active categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{
            height: '100%',
            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StarIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h6">Emerging</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {data.emergingCategories?.length || 0}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                High-growth categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Performance Table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} mb={3} color="primary">
          📊 Category Performance Details
        </Typography>

        {!data.categoryPerformance || data.categoryPerformance.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: 6,
            bgcolor: '#f9f9f9',
            borderRadius: 2
          }}>
            <Typography color="text.secondary">
              No category performance data available
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Sales</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Orders</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>AOV</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Growth</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.categoryPerformance.map((category: any, index: number) => (
                  <TableRow key={category.category} hover>
                    <TableCell>
                      <Chip
                        label={category.category}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                          bgcolor: index === 0 ? 'warning.light' : 'default',
                          color: index === 0 ? 'warning.contrastText' : 'default'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatNumber(category.sales)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(category.revenue)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatNumber(category.orders)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(category.avgOrderValue)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={category.growth > 0 ? 'success.main' : 'error.main'}
                      >
                        {category.growth > 0 ? '+' : ''}{category.growth}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: getTrendColor(category.trend)
                      }}>
                        {getTrendIcon(category.trend)}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* Category Insights */}
      <Grid container spacing={3}>
        {/* Category Distribution */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              🥧 Sales Distribution by Category
            </Typography>

            {!data.categoryDistribution || data.categoryDistribution.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  No distribution data available
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {data.categoryDistribution.map((cat: any, index: number) => (
                  <Box key={cat.category} sx={{ textAlign: 'center' }}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      mx: 'auto'
                    }}>
                      <Typography variant="h6" fontWeight={700} color="white">
                        {cat.percentage}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {cat.category}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Emerging Categories */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="primary">
              🚀 Emerging Categories
            </Typography>

            {!data.emergingCategories || data.emergingCategories.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 6,
                bgcolor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography color="text.secondary">
                  No emerging categories identified
                </Typography>
              </Box>
            ) : (
              <List>
                {data.emergingCategories.map((category: any, index: number) => (
                  <ListItem key={category.category}>
                    <ListItemAvatar>
                      <Avatar sx={{
                        bgcolor: 'success.main',
                        color: 'white'
                      }}>
                        <StarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {category.category}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Growth: +{category.growth}%
                          </Typography>
                          <Chip
                            label={category.potential}
                            color="success"
                            size="small"
                            variant="outlined"
                          />
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

      {/* Summary Footer */}
      <Paper sx={{
        p: 3,
        mt: 4,
        background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          🏆 Category Performance Summary
        </Typography>
        <Typography variant="body1">
          From {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()},
          "{data.bestPerformingCategory?.name}" emerged as the top-performing category with {formatNumber(data.bestPerformingCategory?.sales || 0)} sales
          and {formatCurrency(data.bestPerformingCategory?.revenue || 0)} in revenue. The category showed {data.bestPerformingCategory?.growth || 0}% growth.
          {data.emergingCategories?.length > 0 && ` ${data.emergingCategories.length} categories show high growth potential.`}
        </Typography>
      </Paper>
    </Container>
  );
};

export default CategoryPerformancePage;
