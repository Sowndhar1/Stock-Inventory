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
  AccountBalance as BalanceIcon,
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface RevenueDetailData {
  totalRevenue: number;
  totalSales: number;
  totalItems: number;
  averageOrderValue: number;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    percentage: number;
    transactions: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    revenue: number;
    percentage: number;
    transactions: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    growth: number;
  }>;
  insights: {
    topRevenueCategory: string;
    peakRevenueDay: string;
    averageTransactionValue: number;
    revenuePerCustomer: number;
    seasonalTrends: string[];
    indianMarketInsights: {
      gstCollection: number;
      digitalPaymentPercentage: number;
      cashVsDigitalRatio: string;
      regionalPerformance: Array<{ region: string; revenue: number; growth: number }>;
    };
  };
}

const TotalRevenueDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<RevenueDetailData | null>(null);
  const [printDialog, setPrintDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchRevenueDetail = useCallback(async () => {
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

      const response = await fetch(`/api/reports/revenue-detail?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch revenue details');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading revenue details');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchRevenueDetail();
    }
  }, [fetchRevenueDetail]);

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
    console.log('Exporting revenue report to PDF...');
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Revenue Analysis Report',
        text: `Revenue Report: ${formatCurrency(data?.totalRevenue || 0)} total revenue from ${formatNumber(data?.totalSales || 0)} transactions`,
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
          <IconButton 
            onClick={() => navigate('/reports/sales-overview')}
            color="primary"
            sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700} color="primary">
            Total Revenue Analysis
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
            onClick={fetchRevenueDetail}
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
              <BalanceIcon sx={{ fontSize: 32, color: '#ff9800', mr: 1 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#ff9800">
              {formatCurrency(data.averageOrderValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Transaction Value
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
              <PaymentIcon sx={{ fontSize: 32, color: '#8e24aa', mr: 1 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#8e24aa">
              {data.insights.indianMarketInsights.digitalPaymentPercentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Digital Payments
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Revenue by Category & Payment Methods */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        {/* Revenue by Category */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Revenue by Category
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell align="right"><strong>Revenue (₹)</strong></TableCell>
                  <TableCell align="right"><strong>% of Total</strong></TableCell>
                  <TableCell align="right"><strong>Transactions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.revenueByCategory.map((category) => (
                  <TableRow key={category.category} hover>
                    <TableCell>{category.category}</TableCell>
                    <TableCell align="right">{formatCurrency(category.revenue)}</TableCell>
                    <TableCell align="right">{category.percentage}%</TableCell>
                    <TableCell align="right">{formatNumber(category.transactions)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Payment Methods */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Payment Method Analysis
          </Typography>

          <Box>
            {data.revenueByPaymentMethod.map((method) => (
              <Box key={method.method} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {method.method === 'UPI' ? 'UPI/Digital' : method.method}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {method.percentage}% | {formatNumber(method.transactions)} txns
                  </Typography>
                </Box>
                <Box sx={{
                  width: '100%',
                  height: 8,
                  bgcolor: '#e0e0e0',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <Box sx={{
                    width: `${method.percentage}%`,
                    height: '100%',
                    bgcolor: method.method === 'UPI' ? '#4caf50' : method.method === 'Card' ? '#2196f3' : '#ff9800',
                    transition: 'width 0.3s ease'
                  }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="#43a047" sx={{ mt: 0.5 }}>
                  {formatCurrency(method.revenue)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Indian Market Insights
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                💳 Cash vs Digital: {data.insights.indianMarketInsights.cashVsDigitalRatio}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                📱 UPI Adoption: {data.insights.indianMarketInsights.digitalPaymentPercentage}% of total transactions
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                🏛️ GST Collection: {formatCurrency(data.insights.indianMarketInsights.gstCollection)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Daily Revenue Trend */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          Daily Revenue Trend
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">
            📈 Interactive Chart - Daily Revenue Visualization with Indian Market Context
          </Typography>
        </Box>
      </Paper>

      {/* Regional Performance & GST Analysis */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Regional Revenue Performance
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              🗺️ Regional Revenue Heatmap (Mumbai, Delhi, Bangalore, Chennai, Kolkata)
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            GST & Tax Analysis
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              📊 GST Collection Trends & Tax Compliance Analysis
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
          Revenue Performance Summary
        </Typography>
        <Typography variant="body2">
          Analysis Period: {dateRange.startDate.toLocaleDateString('en-IN')} to {dateRange.endDate.toLocaleDateString('en-IN')}
          <br />
          Total Revenue: {formatCurrency(data.totalRevenue)} | Total Transactions: {formatNumber(data.totalSales)}
          <br />
          Average Transaction Value: {formatCurrency(data.averageOrderValue)}
          <br />
          Digital Payment Adoption: {data.insights.indianMarketInsights.digitalPaymentPercentage}%
          <br />
          <em>Report generated on: {new Date().toLocaleString('en-IN')}</em>
        </Typography>
      </Box>
    </Container>
  );
};

export default TotalRevenueDetailPage;
