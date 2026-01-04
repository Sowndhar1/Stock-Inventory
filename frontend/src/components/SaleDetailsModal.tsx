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
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Paper,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { 
  Close, 
  Receipt, 
  Person, 
  Payment, 
  ShoppingBag, 
  CalendarToday,
  Phone,
  Email,
  LocalOffer
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface SaleDetailsModalProps {
  open: boolean;
  onClose: () => void;
  saleId: string | null;
}

interface SaleItem {
  _id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount: number;
}

interface Sale {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  notes: string;
  createdAt: string;
  soldBy: {
    username: string;
  };
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ open, onClose, saleId }) => {
  const { token } = useAuth();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && saleId) {
      fetchSaleDetails();
    }
  }, [open, saleId]);

  const fetchSaleDetails = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching sale details for ID:', saleId);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`/api/reports/sale/${saleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch sale details');
      }
      
      const data = await response.json();
      console.log('Sale data received:', data);
      setSale(data);
    } catch (err: any) {
      console.error('Error in fetchSaleDetails:', err);
      setError(err.message || 'Error loading sale details');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSale(null);
    setError('');
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      {/* Custom Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Receipt sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Sale Details
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Complete transaction information
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ p: 3, overflow: 'auto', bgcolor: '#f5f7fa' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        
        {sale && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Invoice Header Card */}
            <Card sx={{ 
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
              color: 'white',
              boxShadow: 3
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.8 }}>
                      Invoice Number
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {sale.invoiceNumber}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Chip 
                      label={sale.status} 
                      color={getStatusColor(sale.status) as any}
                      size="medium"
                      sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                    />
                    <Chip 
                      label={sale.paymentStatus} 
                      color={getPaymentStatusColor(sale.paymentStatus) as any}
                      size="medium"
                      sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                    />
                  </Box>
                </Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Date
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" />
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Sold By
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {sale.soldBy?.username || 'System'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Customer Information */}
            {sale.customer.name && (
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Person sx={{ color: '#1976d2', fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={700} color="primary">
                      Customer Information
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Person sx={{ color: '#1976d2' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Name
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {sale.customer.name}
                        </Typography>
                      </Box>
                    </Box>
                    {sale.customer.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Phone sx={{ color: '#1976d2' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Phone Number
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {sale.customer.phone}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {sale.customer.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Email sx={{ color: '#1976d2' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Email Address
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {sale.customer.email}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Items Table */}
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <ShoppingBag sx={{ color: '#1976d2', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700} color="primary">
                    Items Purchased
                  </Typography>
                </Box>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderColor: '#e0e0e0' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1976d2' }}>SKU</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1976d2' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1976d2' }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1976d2' }}>Discount</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#1976d2' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item, index) => (
                    <TableRow key={item._id} sx={{ bgcolor: index % 2 === 0 ? '#fafafa' : 'white' }}>
                      <TableCell sx={{ fontWeight: 500 }}>{item.productName}</TableCell>
                      <TableCell sx={{ color: '#666', fontFamily: 'monospace' }}>{item.sku}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>₹{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: item.discount > 0 ? '#f57c00' : '#666' }}>
                        ₹{item.discount.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        ₹{item.totalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Payment sx={{ color: '#1976d2', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={700} color="primary">
                    Payment Summary
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Payment sx={{ color: '#1976d2', fontSize: 20 }} />
                      <Typography variant="body1" fontWeight={600}>
                        Payment Method
                      </Typography>
                    </Box>
                    <Chip 
                      label={sale.paymentMethod} 
                      color="primary" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      ₹{sale.subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                    <Typography variant="body1" color="text.secondary">
                      Tax (18%)
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      ₹{sale.tax.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {sale.discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ff9800' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalOffer sx={{ color: '#ff9800', fontSize: 20 }} />
                        <Typography variant="body1" color="#f57c00" fontWeight={600}>
                          Discount
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700} color="#f57c00">
                        -₹{sale.discount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    boxShadow: 3
                  }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ color: 'white' }}>
                      ₹{sale.total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              
              {sale.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">Notes</Typography>
                  <Typography variant="body1">{sale.notes}</Typography>
                </Box>
              )}
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, bgcolor: '#f5f7fa' }}>
        <Button 
          onClick={handleClose} 
          variant="contained" 
          size="large"
          sx={{ minWidth: 120 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaleDetailsModal; 