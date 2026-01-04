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
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SalesDetailData {
  total: number;
  totalRevenue: number;
  totalItems: number;
  averageOrderValue: number;
  sales: Array<{
    _id: string;
    invoiceNumber: string;
    customer?: { name: string; phone?: string };
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    createdAt: string;
    paymentMethod: string;
  }>;
  trends: {
    daily: Array<{ date: string; sales: number; revenue: number }>;
    weekly: Array<{ week: string; sales: number; revenue: number }>;
    monthly: Array<{ month: string; sales: number; revenue: number }>;
  };
  insights: {
    peakHours: string[];
    bestSellingProducts: Array<{ name: string; sold: number; revenue: number }>;
    customerSegmentation: Array<{ segment: string; count: number; avgOrder: number }>;
    regionalPerformance: Array<{ region: string; sales: number; customers: number }>;
  };
}

const TotalSalesDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<SalesDetailData | null>(null);
  const [printDialog, setPrintDialog] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [filterOptions, setFilterOptions] = useState({
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: '',
    customerType: 'all'
  });

  const fetchSalesDetail = useCallback(async () => {
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
      if (filterOptions.paymentMethod !== 'all') {
        params.append('paymentMethod', filterOptions.paymentMethod);
      }
      if (filterOptions.minAmount) {
        params.append('minAmount', filterOptions.minAmount);
      }
      if (filterOptions.maxAmount) {
        params.append('maxAmount', filterOptions.maxAmount);
      }

      const response = await fetch(`/api/reports/sales-detail?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch sales details');

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error loading sales details');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange, filterOptions]);

  useEffect(() => {
    if (token) {
      fetchSalesDetail();
    }
  }, [fetchSalesDetail]);

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
    // Create a new window for PDF-friendly content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this site to export PDF');
      return;
    }

    const reportData = {
      title: 'Sales Performance Report',
      dateRange: `${dateRange.startDate.toLocaleDateString('en-IN')} to ${dateRange.endDate.toLocaleDateString('en-IN')}`,
      total: data?.total || 0,
      totalRevenue: data?.totalRevenue || 0,
      totalItems: data?.totalItems || 0,
      averageOrderValue: data?.averageOrderValue || 0,
      insights: data?.insights || {}
    };

    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportData.title}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1976d2;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1976d2;
            margin: 0;
            font-size: 24px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .metric-card {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: #1976d2;
          }
          .metric-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .insights {
            margin-top: 30px;
          }
          .insights h3 {
            color: #1976d2;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .insight-item {
            margin-bottom: 15px;
            padding: 10px;
            background: #f9f9f9;
            border-left: 4px solid #1976d2;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportData.title}</h1>
          <p><strong>Analysis Period:</strong> ${reportData.dateRange}</p>
        </div>

        <div class="summary">
          <div class="metric-card">
            <div class="metric-value">${formatNumber(reportData.total)}</div>
            <div class="metric-label">Total Transactions</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">₹${formatNumber(reportData.totalRevenue)}</div>
            <div class="metric-label">Total Revenue (INR)</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatNumber(reportData.totalItems)}</div>
            <div class="metric-label">Items Sold</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">₹${formatNumber(reportData.averageOrderValue)}</div>
            <div class="metric-label">Average Order Value</div>
          </div>
        </div>

        <div class="insights">
          <h3>Sales Insights</h3>
          {reportData.insights.peakHours ? (
            <div class="insight-item">
              <strong>Peak Hours:</strong> {reportData.insights.peakHours.join(', ')}
            </div>
          ) : (
            <div class="insight-item">
              <strong>Peak Hours:</strong> No data available
            </div>
          )}
          {reportData.insights.topCategory ? (
            <div class="insight-item">
              <strong>Top Category:</strong> {reportData.insights.topCategory}
            </div>
          ) : (
            <div class="insight-item">
              <strong>Top Category:</strong> No data available
            </div>
          )}
          {reportData.insights.salesTrend ? (
            <div class="insight-item">
              <strong>Sales Trend:</strong> {reportData.insights.salesTrend}
            </div>
          ) : (
            <div class="insight-item">
              <strong>Sales Trend:</strong> No data available
            </div>
          )}
        </div>

        <div class="footer">
          <p>Report generated on: ${new Date().toLocaleString('en-IN')}</p>
          <p>Generated by: Sales Analytics Dashboard</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();

    // Wait a moment for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleShareReport = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Sales Performance Report',
          text: `Sales Report: ${formatNumber(data?.total || 0)} transactions, ${formatCurrency(data?.totalRevenue || 0)} revenue`,
          url: window.location.href
        });
      } else {
        // Fallback: Copy to clipboard
        const shareText = `Sales Report: ${formatNumber(data?.total || 0)} transactions, ${formatCurrency(data?.totalRevenue || 0)} revenue\n\nView full report: ${window.location.href}`;

        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          alert('Report details copied to clipboard!');
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Report details copied to clipboard!');
        }
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      // If sharing fails, try clipboard fallback
      try {
        const shareText = `Sales Report: ${formatNumber(data?.total || 0)} transactions, ${formatCurrency(data?.totalRevenue || 0)} revenue`;
        await navigator.clipboard.writeText(shareText);
        alert('Report details copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard fallback also failed:', clipboardError);
      }
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
            Total Sales Analysis
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

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2,
          mb: 3
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
            onClick={fetchSalesDetail}
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

        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
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
                <ReceiptIcon sx={{ fontSize: 32, color: '#1976d2', mr: 1 }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="#1976d2">
                {formatNumber(data.total)}
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
                <CartIcon sx={{ fontSize: 32, color: '#ff9800', mr: 1 }} />
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
                <AnalyticsIcon sx={{ fontSize: 32, color: '#8e24aa', mr: 1 }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="#8e24aa">
                {formatCurrency(data.averageOrderValue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Order Value
              </Typography>
            </CardContent>
          </Card>
        </Box>

      {/* Sales Trend Analysis */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Daily Sales Trend
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              📊 Interactive Chart Placeholder - Sales Trend Visualization
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Sales Insights
          </Typography>

          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Peak Sales Hours
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {data.insights.peakHours.map((hour, index) => (
                  <Chip key={index} label={hour} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Top Payment Methods
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                Cash, UPI, Card (Based on Indian market preferences)
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customer Segments
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                Regular, Walk-in, Online (₹500-₹2000 avg orders)
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Detailed Sales Table */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          Detailed Transaction Log
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Invoice #</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Items</strong></TableCell>
                <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                <TableCell><strong>Payment</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.sales.map((sale) => (
                <TableRow key={sale._id} hover>
                  <TableCell>{sale.invoiceNumber}</TableCell>
                  <TableCell>
                    {sale.customer?.name || 'Walk-in Customer'}
                    {sale.customer?.phone && ` (${sale.customer.phone})`}
                  </TableCell>
                  <TableCell>
                    {sale.items.length} items
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {sale.items.slice(0, 2).map(item => item.name).join(', ')}
                      {sale.items.length > 2 && ` +${sale.items.length - 2} more`}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={600}>
                      {formatCurrency(sale.total)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={sale.paymentMethod}
                      size="small"
                      color={sale.paymentMethod === 'UPI' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(sale.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Regional Performance & Customer Segmentation */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
        mb: 3
      }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Regional Performance
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              🗺️ Regional Sales Heatmap (Mumbai, Delhi, Bangalore, etc.)
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="primary">
            Customer Segmentation
          </Typography>
          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              👥 Customer Behavior Analysis (Loyalty, Spending Patterns)
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
          Sales Performance Summary
        </Typography>
        <Typography variant="body2">
          Analysis Period: {dateRange.startDate.toLocaleDateString('en-IN')} to {dateRange.endDate.toLocaleDateString('en-IN')}
          <br />
          Total Transactions: {formatNumber(data.total)} | Total Revenue: {formatCurrency(data.totalRevenue)}
          <br />
          Average Order Value: {formatCurrency(data.averageOrderValue)} | Items Sold: {formatNumber(data.totalItems)}
          <br />
          <em>Report generated on: {new Date().toLocaleString('en-IN')}</em>
        </Typography>
      </Box>
    </Container>
  );
};

export default TotalSalesDetailPage;
