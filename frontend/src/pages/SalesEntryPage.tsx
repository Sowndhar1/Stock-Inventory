import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Select, MenuItem, TextField, Alert, CircularProgress, FormControl, InputLabel, Paper, IconButton, Divider
} from '@mui/material';
import { Add, Remove, Delete, Receipt, ArrowBack, ShoppingCart, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const SalesEntryPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products?limit=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setProducts(data.products || data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = () => {
    if (!selectedProductId || quantity < 1) return;

    const product = products.find(p => p._id === selectedProductId);
    if (!product) {
      setError('Selected product not found');
      return;
    }

    if (product.quantity < quantity) {
      setError(`Insufficient stock. Available: ${product.quantity}`);
      return;
    }

    setCart([...cart, { product, quantity }]);
    setSelectedProductId('');
    setQuantity(1);
    setError('');
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.product._id !== id));
  };

  const handleQuantityChange = (id: string, qty: number) => {
    if (qty < 1) return;

    const item = cart.find(item => item.product._id === id);
    if (item && qty > item.product.quantity) {
      setError(`Insufficient stock. Available: ${item.product.quantity}`);
      return;
    }

    setCart(cart.map(item =>
      item.product._id === id ? { ...item, quantity: qty } : item
    ));
    setError('');
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleSubmitSale = async () => {
    if (cart.length === 0) {
      setError('Please add items to cart');
      return;
    }

    if (!customerName.trim()) {
      setError('Please enter customer name');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const saleData = {
        customer: {
          name: customerName.trim(),
          phone: '',
          email: ''
        },
        items: cart.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          discount: 0
        })),
        paymentMethod: paymentMethod,
        paymentReference: `${paymentMethod}-${Date.now()}`,
        notes: '',
        subtotal: subtotal,
        tax: tax,
        total: total
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleData)
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      setSuccess('Sale recorded successfully!');
      setCart([]);
      setCustomerName('');
      setPaymentMethod('Cash');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Error recording sale:', err);
      setError(err.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setError('');
  };

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto', pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate('/dashboard')}
          color="primary"
          sx={{
            mr: 2,
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText' }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={700} color="primary">
            Sales Entry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create new sale and generate invoice
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Cart: {cart.length} items
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Main Content */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        {/* Product Selection */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart color="primary" />
            Add Products
          </Typography>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Search Products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              placeholder="Type to search products..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Select Product</InputLabel>
              <Select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                label="Select Product"
              >
                {products
                  .filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((product) => (
                  <MenuItem key={product._id} value={product._id}>
                    {product.name} - ₹{product.price} (Stock: {product.quantity})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAddToCart}
              disabled={!selectedProductId || quantity < 1}
              startIcon={<Add />}
              fullWidth
            >
              Add to Cart
            </Button>
          </Box>
        </Paper>

        {/* Cart */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            Cart ({cart.length} items)
          </Typography>
          {cart.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No items in cart
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {cart.map((item) => (
                <Box key={item.product._id} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                      sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center', fontWeight: 600 }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}
                    >
                      <Add />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveFromCart(item.product._id)}
                      sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main' } }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Customer Details & Payment */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Customer Details & Payment</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
          <TextField
            label="Customer Name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            fullWidth
            required
            error={!customerName.trim() && submitting}
            helperText={!customerName.trim() && submitting ? 'Required' : ''}
          />
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Order Summary</Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">Subtotal:</Typography>
            <Typography variant="body1" fontWeight={500}>₹{subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">Tax (18%):</Typography>
            <Typography variant="body1" fontWeight={500}>₹{tax.toFixed(2)}</Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" color="primary">Total Amount:</Typography>
            <Typography variant="h6" color="primary" fontWeight={700}>₹{total.toFixed(2)}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{
        display: 'flex',
        gap: 2,
        justifyContent: 'flex-end',
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Button
          variant="outlined"
          size="large"
          onClick={clearCart}
          disabled={cart.length === 0}
        >
          Clear Cart
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmitSale}
          disabled={cart.length === 0 || submitting || !customerName.trim()}
          sx={{ minWidth: 200 }}
        >
          {submitting ? 'Recording Sale...' : 'Complete Sale'}
        </Button>
      </Box>
    </Box>
  );
};

export default SalesEntryPage; 