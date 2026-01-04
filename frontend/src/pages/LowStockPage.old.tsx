import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, 
  Chip, Alert, CircularProgress, Button, TextField, InputAdornment, 
  IconButton, Tooltip, useTheme, useMediaQuery
} from '@mui/material';
import { Search, Refresh, Add, Warning, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  reorderPoint: number;
  reorderQuantity: number;
  lowStockAlert: boolean;
  supplier?: {
    name: string;
    contact: string;
    email: string;
  };
}

const LowStockPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLowStockProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      // Filter for low stock products
      const lowStockProducts = data.products.filter((product: Product) => 
        product.lowStockAlert || product.quantity <= product.reorderPoint
      );
      setProducts(lowStockProducts);
    } catch (err: any) {
      setError(err.message || 'Error loading low stock products');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchLowStockProducts();
    }
  }, [fetchLowStockProducts, token]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'error' as const };
    if (quantity <= 2) return { status: 'Critical', color: 'error' as const };
    if (quantity <= reorderPoint) return { status: 'Low Stock', color: 'warning' as const };
    return { status: 'In Stock', color: 'success' as const };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
      {/* Header */}
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
        <Typography variant="h4" fontWeight={700} color="primary" sx={{ flexGrow: 1 }}>
          Low Stock Items
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchLowStockProducts} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Warning sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {products.length} Items Need Attention
            </Typography>
            <Typography variant="body2">
              {products.filter(p => p.quantity === 0).length} out of stock • 
              {products.filter(p => p.quantity > 0 && p.quantity <= 2).length} critical • 
              {products.filter(p => p.quantity > 2 && p.quantity <= p.reorderPoint).length} low stock
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Search and Actions */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <TextField
          label="Search Low Stock Items"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: isMobile ? '100%' : 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => navigate('/products')}
        >
          Add New Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <Paper sx={{ overflow: 'auto' }}>
        {filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm ? 'No low stock items found matching your search.' : 'No low stock items found.'}
            </Typography>
            {!searchTerm && (
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/products')}
              >
                View All Products
              </Button>
            )}
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>SKU</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Current Stock</strong></TableCell>
                <TableCell><strong>Reorder Point</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.quantity, product.reorderPoint);
                return (
                  <TableRow key={product._id} sx={{ 
                    bgcolor: product.quantity === 0 ? 'error.light' : 
                             product.quantity <= 2 ? 'warning.light' : 'inherit'
                  }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.brand} • {product.size} • {product.color}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={product.quantity === 0 ? 'error.main' : 
                               product.quantity <= 2 ? 'warning.main' : 'inherit'}
                      >
                        {product.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>{product.reorderPoint}</TableCell>
                    <TableCell>
                      <Chip 
                        label={stockStatus.status} 
                        color={stockStatus.color} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => navigate(`/products?edit=${product._id}`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default LowStockPage; 