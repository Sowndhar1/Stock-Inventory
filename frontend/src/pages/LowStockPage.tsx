import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, TextField, InputAdornment,
  IconButton, Tooltip, useTheme, useMediaQuery, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Card, CardContent, CardActions,
  FormControl, InputLabel, Select, MenuItem, Divider, Stack, Chip, Alert, CircularProgress
} from '@mui/material';
import {
  Search, Refresh, Add, Warning, ArrowBack, Inventory,
  AddShoppingCart, TrendingDown, Edit as EditIcon
} from '@mui/icons-material';
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
  costPrice: number;
  reorderPoint: number;
  reorderQuantity: number;
  lowStockAlert: boolean;
  stockStatus?: {
    status: string;
    color: string;
    severity: number;
  };
  supplier?: {
    name: string;
    contact: string;
    email: string;
  };
}

const categories = ['Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Dresses', 'Shoes', 'Accessories'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const LowStockPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchLowStockProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/products/low-stock?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch low stock products');
      const data = await res.json();
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message || 'Error loading low stock products');
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm]);

  useEffect(() => {
    if (token) {
      fetchLowStockProducts();
    }
  }, [fetchLowStockProducts, token]);

  const filteredProducts = products;

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'error' as const, severity: 3 };
    if (quantity <= 2) return { status: 'Critical', color: 'error' as const, severity: 3 };
    if (quantity <= reorderPoint) return { status: 'Low Stock', color: 'warning' as const, severity: 2 };
    return { status: 'In Stock', color: 'success' as const, severity: 1 };
  };

  const handleAddDialogOpen = () => {
    setForm({
      name: '', sku: '', brand: '', category: '', size: '', color: '',
      quantity: 0, price: 0, costPrice: 0, reorderPoint: 5, reorderQuantity: 10, description: ''
    });
    setAddDialogOpen(true);
  };

  const handleEditDialogOpen = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      size: product.size,
      color: product.color,
      quantity: product.quantity,
      price: product.price,
      costPrice: product.costPrice || 0,
      reorderPoint: product.reorderPoint,
      reorderQuantity: product.reorderQuantity,
      description: ''
    });
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => {
    setForm({ ...form, [e.target.name as string]: e.target.value });
  };

  const handleSubmitProduct = async () => {
    if (!form.name || !form.sku || !form.category) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== null) {
          formData.append(key, form[key].toString());
        }
      });

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Failed to ${editingProduct ? 'update' : 'create'} product`);
      }

      await fetchLowStockProducts(); // Refresh the list
      handleDialogClose();
    } catch (err: any) {
      setError(err.message || `Failed to ${editingProduct ? 'update' : 'create'} product`);
    } finally {
      setSubmitting(false);
    }
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {products.filter(p => p.quantity === 0).length}
              </Typography>
              <Typography variant="body2">Out of Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {products.filter(p => p.quantity > 0 && p.quantity <= 2).length}
              </Typography>
              <Typography variant="body2">Critical Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Inventory sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {products.length}
              </Typography>
              <Typography variant="body2">Total Low Stock</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddDialogOpen}
            sx={{ minWidth: 150 }}
          >
            Add New Product
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddShoppingCart />}
            onClick={() => navigate('/products')}
            sx={{ minWidth: 150 }}
          >
            Manage All Products
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Grid/Cards */}
      {filteredProducts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Inventory sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
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
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => {
            const stockStatus = product.stockStatus || getStockStatus(product.quantity, product.reorderPoint);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `2px solid ${stockStatus.color === 'error' ? theme.palette.error.main :
                    stockStatus.color === 'warning' ? theme.palette.warning.main :
                    theme.palette.success.main}`,
                  bgcolor: stockStatus.color === 'error' ? 'error.light' :
                          stockStatus.color === 'warning' ? 'warning.light' : 'inherit'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {product.name}
                      </Typography>
                      <Chip
                        label={stockStatus.status}
                        color={stockStatus.color}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>SKU:</strong> {product.sku}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Brand:</strong> {product.brand}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Category:</strong> {product.category}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Size/Color:</strong> {product.size} • {product.color}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        Current Stock:
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        color={product.quantity === 0 ? 'error.main' :
                               product.quantity <= 2 ? 'warning.main' : 'inherit'}
                      >
                        {product.quantity}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">
                        Reorder Point:
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {product.reorderPoint}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        Price:
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        ₹{product.price}
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditDialogOpen(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<AddShoppingCart />}
                      onClick={() => {
                        // Quick restock functionality - you can implement this
                        console.log('Quick restock for:', product.name);
                      }}
                    >
                      Restock
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField
              label="Product Name *"
              name="name"
              value={form.name || ''}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="SKU *"
              name="sku"
              value={form.sku || ''}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    name="brand"
                    value={form.brand || ''}
                    onChange={(e) => handleFormChange(e)}
                    label="Brand"
                  >
                    <MenuItem value="Nike">Nike</MenuItem>
                    <MenuItem value="Adidas">Adidas</MenuItem>
                    <MenuItem value="Puma">Puma</MenuItem>
                    <MenuItem value="Reebok">Reebok</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    name="category"
                    value={form.category || ''}
                    onChange={(e) => handleFormChange(e)}
                    label="Category *"
                    required
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Size</InputLabel>
                  <Select
                    name="size"
                    value={form.size || ''}
                    onChange={(e) => handleFormChange(e)}
                    label="Size"
                  >
                    {sizes.map(size => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Color"
                  name="color"
                  value={form.color || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={form.quantity || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Cost Price"
                  name="costPrice"
                  type="number"
                  value={form.costPrice || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmitProduct}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, pt: 1 }}>
            <TextField
              label="Product Name *"
              name="name"
              value={form.name || ''}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="SKU *"
              name="sku"
              value={form.sku || ''}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Brand</InputLabel>
                  <Select
                    name="brand"
                    value={form.brand || ''}
                    onChange={(e) => handleFormChange(e)}
                    label="Brand"
                  >
                    <MenuItem value="Nike">Nike</MenuItem>
                    <MenuItem value="Adidas">Adidas</MenuItem>
                    <MenuItem value="Puma">Puma</MenuItem>
                    <MenuItem value="Reebok">Reebok</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    name="category"
                    value={form.category || ''}
                    onChange={(e) => handleFormChange(e)}
                    label="Category *"
                    required
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Size</InputLabel>
                  <Select
                    name="size"
                    value={form.size || ''}
                    onChange={(e) => handleFormChange(e)}
                    label="Size"
                  >
                    {sizes.map(size => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Color"
                  name="color"
                  value={form.color || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={form.quantity || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Price"
                  name="price"
                  type="number"
                  value={form.price || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Cost Price"
                  name="costPrice"
                  type="number"
                  value={form.costPrice || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Reorder Point"
                  name="reorderPoint"
                  type="number"
                  value={form.reorderPoint || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Reorder Quantity"
                  name="reorderQuantity"
                  type="number"
                  value={form.reorderQuantity || ''}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmitProduct}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LowStockPage;
