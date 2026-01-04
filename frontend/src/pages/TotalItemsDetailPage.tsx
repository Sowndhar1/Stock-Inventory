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
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Store as StoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ItemsSoldDetailData {
  totalItems: number;
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  itemsByCategory: Array<{
    category: string;
    itemsSold: number;
    percentage: number;
    revenue: number;
  }>;
  topSellingProducts: Array<{
    name: string;
    itemsSold: number;
    revenue: number;
    category: string;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  }>;
  inventoryMovement: Array<{
    date: string;
    itemsSold: number;
    newStock: number;
    returned: number;
  }>;
  stockAlerts: Array<{
    productName: string;
    currentStock: number;
    minimumStock: number;
    status: 'Critical' | 'Low' | 'Good';
  }>;
  insights: {
    fastestMovingProduct: string;
    slowestMovingProduct: string;
    peakSellingDay: string;
    seasonalTrends: string[];
    inventoryTurnover: number;
    indianMarketInsights: {
      gstApplicableItems: number;
      seasonalDemand: string[];
      regionalPreferences: Array<{ region: string; topProducts: string[] }>;
      supplyChainImpact: string;
    };
  };
}

const TotalItemsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ItemsSoldDetailData | null>(null);
  const [printDialog, setPrintDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchItemsDetail = useCallback(async () => {
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

      const response = await fetch(`/api/reports/items-detail?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch items details');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading items details');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchItemsDetail();
    }
  }, [fetchItemsDetail]);

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
    console.log('Exporting items report to PDF...');
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Items Sold Analysis Report',
        text: `Items Report: ${formatNumber(data?.totalItems || 0)} items sold, ${formatCurrency(data?.totalRevenue || 0)} revenue`,
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
            Total Items Sold Analysis
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
            onClick={fetchItemsDetail}
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
              <InventoryIcon sx={{ fontSize: 32, color: '#ff9800', mr: 1 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#ff9800">
              {formatNumber(data.totalItems)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items Sold
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
              Revenue Generated (INR)
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
              <BusinessIcon sx={{ fontSize: 32, color: '#8e24aa', mr: 1 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#8e24aa">
              {data.insights.inventoryTurnover}x
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Inventory Turnover
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Items by Category & Top Selling Products */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        {/* Items by Category */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Items Sold by Category
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell align="right"><strong>Items Sold</strong></TableCell>
                  <TableCell align="right"><strong>% of Total</strong></TableCell>
                  <TableCell align="right"><strong>Revenue (₹)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.itemsByCategory.map((category) => (
                  <TableRow key={category.category} hover>
                    <TableCell>{category.category}</TableCell>
                    <TableCell align="right">{formatNumber(category.itemsSold)}</TableCell>
                    <TableCell align="right">{category.percentage}%</TableCell>
                    <TableCell align="right">{formatCurrency(category.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Stock Alerts */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Inventory Alerts
          </Typography>

          <Box>
            {data.stockAlerts.map((alert, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {alert.productName}
                  </Typography>
                  <Chip
                    icon={alert.status === 'Critical' ? <WarningIcon /> : <CheckIcon />}
                    label={alert.status}
                    color={alert.status === 'Critical' ? 'error' : alert.status === 'Low' ? 'warning' : 'success'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Current Stock: {formatNumber(alert.currentStock)} | Minimum Required: {formatNumber(alert.minimumStock)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Indian Market Insights
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                📦 GST Applicable: {formatNumber(data.insights.indianMarketInsights.gstApplicableItems)} items
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                🎯 Seasonal Demand: {data.insights.indianMarketInsights.seasonalDemand.join(', ')}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                🏪 Supply Chain Impact: {data.insights.indianMarketInsights.supplyChainImpact}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Top Selling Products */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          Top Selling Products
        </Typography>

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 2
        }}>
          {data.topSellingProducts.map((product, index) => (
            <Card key={index} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  #{index + 1} {product.name}
                </Typography>
                <Chip
                  label={product.stockStatus}
                  color={product.stockStatus === 'In Stock' ? 'success' : product.stockStatus === 'Low Stock' ? 'warning' : 'error'}
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category: {product.category}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Items Sold: {formatNumber(product.itemsSold)}
                </Typography>
                <Typography variant="h6" fontWeight={700} color="#43a047">
                  {formatCurrency(product.revenue)}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </Paper>

      {/* Inventory Movement Trend */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          Inventory Movement Trend
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">
            📈 Interactive Chart - Daily Items Sold & Stock Movement
          </Typography>
        </Box>
      </Paper>

      {/* Regional Performance & Seasonal Analysis */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Regional Performance
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              🗺️ Regional Sales Heatmap (Mumbai, Delhi, Bangalore, Chennai, Kolkata)
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Seasonal Demand Analysis
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              📊 Seasonal Trends & Festival Impact on Item Sales
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
          Items Sold Performance Summary
        </Typography>
        <Typography variant="body2">
          Analysis Period: {dateRange.startDate.toLocaleDateString('en-IN')} to {dateRange.endDate.toLocaleDateString('en-IN')}
          <br />
          Total Items Sold: {formatNumber(data.totalItems)} | Total Transactions: {formatNumber(data.totalSales)}
          <br />
          Revenue Generated: {formatCurrency(data.totalRevenue)} | Inventory Turnover: {data.insights.inventoryTurnover}x
          <br />
          Fastest Moving: {data.insights.fastestMovingProduct} | Peak Day: {data.insights.peakSellingDay}
          <br />
          <em>Report generated on: {new Date().toLocaleString('en-IN')}</em>
        </Typography>
      </Box>
    </Container>
  );
};

export default TotalItemsDetailPage;
