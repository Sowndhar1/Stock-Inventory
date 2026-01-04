import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert, Paper, useTheme, useMediaQuery,
  TextField, Button, IconButton, Tooltip
} from '@mui/material';
import { Visibility, History, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import ChartCard from '../components/ChartCard.tsx';
import SaleDetailsModal from '../components/SaleDetailsModal.tsx';
import CustomerHistoryModal from '../components/CustomerHistoryModal.tsx';
import { useNavigate } from 'react-router-dom';

const StatCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <Paper sx={{
    bgcolor: color || 'white',
    color: color ? 'white' : 'primary.main',
    borderRadius: 2,
    p: 3,
    minWidth: 120,
    textAlign: 'center',
    boxShadow: 2,
    fontWeight: 600,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }}>
    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{value}</Typography>
    <Typography variant="body2" sx={{ opacity: 0.9 }}>{label}</Typography>
  </Paper>
);

const ReportsPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [saleDetailsOpen, setSaleDetailsOpen] = useState(false);
  const [customerHistoryOpen, setCustomerHistoryOpen] = useState(false);

  const fetchReport = useCallback(async () => {
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

      const res = await fetch(`/api/reports/sales?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch report');
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error loading report');
    } finally {
      setLoading(false);
    }
  }, [token, dateRange]);

  useEffect(() => {
    if (token) {
      fetchReport();
    }
  }, [fetchReport]);

  const handleSaleClick = (saleId: string) => {
    setSelectedSaleId(saleId);
    setSaleDetailsOpen(true);
  };

  const handleCustomerHistoryClick = (customerName: string) => {
    setSelectedCustomer(customerName);
    setCustomerHistoryOpen(true);
  };

  if (loading && !report) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!report) return null;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
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
        <Typography variant="h4" fontWeight={700} color="primary">
          Sales Reports & Analytics
        </Typography>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
        <Typography variant="h6" mb={3} sx={{ color: '#1976d2', fontWeight: 600 }}>
          Filter by Date Range
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          alignItems: 'end'
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
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
              },
            }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#1976d2',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() => fetchReport()}
            fullWidth
            sx={{
              bgcolor: '#1976d2',
              fontWeight: 600,
              py: 1.5,
              '&:hover': {
                bgcolor: '#1565c0',
              },
            }}
          >
            Apply Filter
          </Button>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(5, 1fr)'
        },
        gap: 3,
        mb: 4
      }}>
        <StatCard label="Total Sales" value={report.total || 0} color="#1976d2" />
        <StatCard label="Total Revenue" value={`₹${(report.totalRevenue || 0).toFixed(2)}`} color="#43a047" />
        <StatCard label="Total Items Sold" value={report.totalItems || 0} color="#fbc02d" />
        <StatCard label="Average Order Value" value={`₹${report.averageOrderValue ? report.averageOrderValue.toFixed(2) : '0.00'}`} color="#8e24aa" />
        <StatCard label="Top Selling Category" value={report.topCategory || 'N/A'} color="#ff9800" />
      </Box>

      {/* Sales Table */}
      <Paper sx={{ p: 3, boxShadow: 3, border: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight={600} mb={3} sx={{ color: '#1976d2' }}>
          Sales List
        </Typography>
        {(!report.sales || report.sales.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" variant="h6">
              No sales found.
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
              Start making sales to see them here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflow: 'auto' }}>
            <Table size={isMobile ? "small" : "medium"} sx={{ '& .MuiTableCell-root': { borderColor: '#e0e0e0' } }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Invoice</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.sales.map((sale: any, index: number) => (
                  <TableRow key={sale._id} hover sx={{ bgcolor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                    <TableCell sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      {sale.invoiceNumber || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {sale.customer?.name || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1976d2' }}>
                      ₹{(sale.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Sale Details">
                          <IconButton
                            size="small"
                            onClick={() => handleSaleClick(sale._id)}
                            color="primary"
                            sx={{
                              bgcolor: 'rgba(25, 118, 210, 0.1)',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {sale.customer?.name && (
                          <Tooltip title="View Customer History">
                            <IconButton
                              size="small"
                              onClick={() => handleCustomerHistoryClick(sale.customer.name)}
                              color="secondary"
                              sx={{
                                bgcolor: 'rgba(156, 39, 176, 0.1)',
                                '&:hover': { bgcolor: 'rgba(156, 39, 176, 0.2)' }
                              }}
                            >
                              <History />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {/* Modals */}
      <SaleDetailsModal
        open={saleDetailsOpen}
        onClose={() => setSaleDetailsOpen(false)}
        saleId={selectedSaleId}
      />

      <CustomerHistoryModal
        open={customerHistoryOpen}
        onClose={() => setCustomerHistoryOpen(false)}
        customerName={selectedCustomer}
      />
    </Box>
  );
};

export default ReportsPage;
