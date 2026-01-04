import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface CustomerHistoryModalProps {
  open: boolean;
  onClose: () => void;
  customerName: string;
}

interface SaleItem {
  _id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CustomerSale {
  _id: string;
  invoiceNumber: string;
  items: SaleItem[];
  total: number;
  createdAt: string;
  paymentStatus: string;
  status: string;
}

interface CustomerHistory {
  sales: CustomerSale[];
  totalPages: number;
  currentPage: number;
  total: number;
  customerStats: {
    totalOrders: number;
    totalSpent: number;
    totalItems: number;
  };
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({ open, onClose, customerName }) => {
  const { token, logout } = useAuth();
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (open && customerName) {
      fetchCustomerHistory();
    }
  }, [open, customerName]);

  const fetchCustomerHistory = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate);
      }

      const response = await fetch(`/api/reports/customer-history/${encodeURIComponent(customerName)}?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer history');
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Error loading customer history');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchCustomerHistory(1);
  };

  const handleClose = () => {
    setHistory(null);
    setError('');
    setDateRange({ startDate: '', endDate: '' });
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      case 'Refunded': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'Partial': return 'info';
      default: return 'default';
    }
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Purchase History - {customerName}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {history && !loading && (
          <Box>
            {/* Customer Statistics */}
            <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'white', mb: 3 }}>
                Customer Statistics
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
                gap: 3 
              }}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                    {history.customerStats.totalOrders}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    Total Orders
                  </Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                    ₹{history.customerStats.totalSpent.toFixed(2)}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    Total Spent
                  </Typography>
                </Box>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 1 }}>
                    {history.customerStats.totalItems}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    Total Items
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Date Range Filter */}
            <Paper sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', bgcolor: '#fafafa' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
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
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ 
                    ...prev, 
                    startDate: e.target.value 
                  }))}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
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
                    '& .MuiInputLabel-root': {
                      color: '#666',
                      backgroundColor: 'white',
                      padding: '0 4px',
                      '&.Mui-focused': {
                        color: '#1976d2',
                      },
                    },
                  }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ 
                    ...prev, 
                    endDate: e.target.value 
                  }))}
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
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
                    '& .MuiInputLabel-root': {
                      color: '#666',
                      backgroundColor: 'white',
                      padding: '0 4px',
                      '&.Mui-focused': {
                        color: '#1976d2',
                      },
                    },
                  }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleDateFilter}
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

            {/* Purchase History Table */}
            <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1976d2', mb: 2 }}>
                Purchase History ({history.total} orders)
              </Typography>
              
              {history.sales.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography color="text.secondary" variant="h6">
                    No purchases found for this customer.
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                    This customer hasn't made any purchases yet.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflow: 'auto' }}>
                  <Table size="small" sx={{ '& .MuiTableCell-root': { borderColor: '#e0e0e0' } }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Invoice</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Items</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#1976d2' }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Payment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.sales.map((sale, index) => (
                        <TableRow key={sale._id} hover sx={{ bgcolor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                          <TableCell sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                            {sale.invoiceNumber}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {sale.items.map((item) => (
                                <Typography key={item._id} variant="body2" sx={{ 
                                  color: '#666',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5
                                }}>
                                  <span style={{ fontWeight: 600, color: '#1976d2' }}>
                                    {item.quantity}x
                                  </span>
                                  {item.productName}
                                </Typography>
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2' }}>
                            ₹{sale.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={sale.status} 
                              color={getStatusColor(sale.status) as any}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={sale.paymentStatus} 
                              color={getPaymentStatusColor(sale.paymentStatus) as any}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerHistoryModal; 