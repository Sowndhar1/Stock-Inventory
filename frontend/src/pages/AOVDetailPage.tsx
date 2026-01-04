import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Paper, Typography, Box, Button, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Card, CardContent, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, CircularProgress, Divider, Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CalendarToday as CalendarIcon,
  Assessment as AnalyticsIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  GetApp as ExportIcon,
  PictureAsPdf as PdfIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  EmojiEvents as TrophyIcon,
  Schedule as TimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface AOVDetailData {
  averageOrderValue: number;
  totalSales: number;
  totalRevenue: number;
  totalItems: number;
  customerSegmentation: Array<{
    segment: string;
    customers: number;
    avgOrderValue: number;
    totalRevenue: number;
    percentage: number;
  }>;
  timeBasedAOV: Array<{
    timeSlot: string;
    avgOrderValue: number;
    transactions: number;
    revenue: number;
  }>;
  categoryWiseAOV: Array<{
    category: string;
    avgOrderValue: number;
    transactions: number;
    revenue: number;
  }>;
  trends: Array<{
    date: string;
    avgOrderValue: number;
    transactions: number;
  }>;
  insights: {
    highestAOVCustomer: string;
    lowestAOVCustomer: string;
    peakAOVTime: string;
    bestPerformingCategory: string;
    improvementOpportunities: string[];
    indianMarketInsights: {
      gstImpact: string;
      regionalVariations: Array<{ region: string; avgAOV: number; reason: string }>;
      paymentMethodImpact: Array<{ method: string; avgAOV: number; percentage: number }>;
      customerLoyalty: string;
    };
  };
}

const AOVDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<AOVDetailData | null>(null);
  const [printDialog, setPrintDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchAOVDetail = useCallback(async () => {
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

      const response = await fetch(`/api/reports/aov-detail?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch AOV details');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading AOV details');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchAOVDetail();
    }
  }, [fetchAOVDetail]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    console.log('Exporting AOV report to PDF...');
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Average Order Value Analysis Report',
        text: `AOV Report: ${formatCurrency(data?.averageOrderValue || 0)} average order value across ${formatNumber(data?.totalSales || 0)} transactions`,
        url: window.location.href
      });
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/reports/sales-overview')}
            variant="outlined"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight={700} color="primary">
            Average Order Value Analysis
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Print Report">
            <IconButton onClick={handlePrint} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export PDF">
            <IconButton onClick={handleExportPDF} color="secondary">
              <PdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Report">
            <IconButton onClick={handleShareReport} color="success">
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{
        p: 3,
        mb: 3,
        backgroundColor: '#f8f9fa'
      }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Filter Analysis Period
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
            onClick={fetchAOVDetail}
            fullWidth
            startIcon={<FilterIcon />}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Paper>

      {/* Key Metrics Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        <Card sx={{
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <MoneyIcon sx={{ fontSize: 32, color: '#8e24aa', mr: 1 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#8e24aa">
              {formatCurrency(data.averageOrderValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Order Value (INR)
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <ReceiptIcon sx={{ fontSize: 32, color: '#1976d2', mr: 1 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#1976d2">
              {formatNumber(data.totalSales)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Transactions
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <MoneyIcon sx={{ fontSize: 32, color: '#43a047', mr: 1 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#43a047">
              {formatCurrency(data.totalRevenue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue (INR)
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrophyIcon sx={{ fontSize: 32, color: '#ff9800', mr: 1 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#ff9800">
              {data.insights.bestPerformingCategory}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Best Category
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Customer Segmentation & Time-based AOV */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        {/* Customer Segmentation */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Customer Segmentation by AOV
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Segment</strong></TableCell>
                  <TableCell align="right"><strong>Customers</strong></TableCell>
                  <TableCell align="right"><strong>Avg AOV (₹)</strong></TableCell>
                  <TableCell align="right"><strong>Revenue (₹)</strong></TableCell>
                  <TableCell align="right"><strong>% of Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.customerSegmentation.map((segment) => (
                  <TableRow key={segment.segment} hover>
                    <TableCell>{segment.segment}</TableCell>
                    <TableCell align="right">{formatNumber(segment.customers)}</TableCell>
                    <TableCell align="right">{formatCurrency(segment.avgOrderValue)}</TableCell>
                    <TableCell align="right">{formatCurrency(segment.totalRevenue)}</TableCell>
                    <TableCell align="right">{segment.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Time-based AOV */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Time-based Average Order Value
          </Typography>

          <Box>
            {data.timeBasedAOV.map((timeSlot) => (
              <Box key={timeSlot.timeSlot} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {timeSlot.timeSlot}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatNumber(timeSlot.transactions)} transactions
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={600} color="#8e24aa">
                  {formatCurrency(timeSlot.avgOrderValue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue: {formatCurrency(timeSlot.revenue)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Indian Market Insights
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                💳 GST Impact: {data.insights.indianMarketInsights.gstImpact}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                👥 Customer Loyalty: {data.insights.indianMarketInsights.customerLoyalty}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Category-wise AOV */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          Average Order Value by Category
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 2
        }}>
          {data.categoryWiseAOV.map((category) => (
            <Card key={category.category} sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {category.category}
              </Typography>

              <Typography variant="h5" fontWeight={700} color="#8e24aa" gutterBottom>
                {formatCurrency(category.avgOrderValue)}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(category.transactions)} transactions
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatCurrency(category.revenue)} revenue
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </Paper>

      {/* AOV Trend */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          AOV Trend Analysis
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">
            📈 Interactive Chart - AOV Trends Over Time with Customer Segmentation
          </Typography>
        </Box>
      </Paper>

      {/* Regional Variations & Payment Method Impact */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Regional AOV Variations
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              🗺️ Regional AOV Heatmap (Mumbai, Delhi, Bangalore, Chennai, Kolkata)
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Payment Method Impact on AOV
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              💳 Payment Method Analysis & AOV Correlation
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Print-Friendly Footer */}
      <Box sx={{
        mt: 4,
        p: 3,
        backgroundColor: '#1976d2',
        color: 'white',
        borderRadius: 2,
        '@media print': {
          backgroundColor: 'white',
          color: 'black',
          border: '2px solid #1976d2'
        }
      }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Average Order Value Summary
        </Typography>
        <Typography variant="body2">
          Analysis Period: {dateRange.startDate.toLocaleDateString('en-IN')} to {dateRange.endDate.toLocaleDateString('en-IN')}
          <br />
          Average Order Value: {formatCurrency(data.averageOrderValue)} | Total Transactions: {formatNumber(data.totalSales)}
          <br />
          Total Revenue: {formatCurrency(data.totalRevenue)} | Best Performing Category: {data.insights.bestPerformingCategory}
          <br />
          Peak AOV Time: {data.insights.peakAOVTime} | Highest AOV Customer: {data.insights.highestAOVCustomer}
          <br />
          <em>Report generated on: {new Date().toLocaleString('en-IN')}</em>
        </Typography>
      </Box>
    </Container>
  );
};

export default AOVDetailPage;
