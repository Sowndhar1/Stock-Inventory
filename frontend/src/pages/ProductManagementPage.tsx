import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, Chip, Alert, CircularProgress, FormControl, InputLabel, Paper, useTheme, useMediaQuery, Tooltip, Card, CardContent, CardMedia, Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Search as Search,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
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
  description?: string;
  lowStockAlert?: boolean;
  image?: string;
}

const categories = ['Shirts', 'T-Shirts', 'Pants', 'Jeans', 'Jackets', 'Dresses', 'Shoes', 'Accessories'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const ProductManagementPage: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Request all products by setting a high limit
      const res = await fetch('/api/products?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || 'Error loading products');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { 
    if (token) {
      fetchProducts(); 
    }
  }, [fetchProducts]);

  const handleDialogOpen = (product?: Product) => {
    setEditingProduct(product || null);
    setForm(product || { name: '', sku: '', brand: '', category: '', size: '', color: '', quantity: 0, price: 0, costPrice: 0, description: '' });
    setImageFile(null);
    setImagePreview(product?.image || '');
    setDialogOpen(true);
  };

  const handleDialogClose = () => { 
    setDialogOpen(false); 
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: unknown } }) => {
    setForm({ ...form, [e.target.name as string]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Upload image first if there's a new image file
      let imageUrl = form.image || '';
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const imageRes = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: imageFormData
        });

        if (!imageRes.ok) throw new Error('Failed to upload image');
        const imageData = await imageRes.json();
        imageUrl = imageData.imageUrl;
      }

      const productData = { ...form, image: imageUrl };
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(productData)
      });

      if (!res.ok) throw new Error('Failed to save product');
      handleDialogClose();
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchProducts();
    } catch (err: any) {
      setError(err.message || 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        gap: isMobile ? 2 : 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton 
              onClick={() => navigate('/dashboard')}
              color="primary"
              sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main' } }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" fontWeight={700} color="primary">
            Product Management
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'inventory') && (
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleDialogOpen()}
            sx={{ minWidth: isMobile ? '100%' : 'auto' }}
          >
            ADD PRODUCT
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, 
          gap: 2,
          alignItems: 'center'
        }}>
          <TextField
            label="Search Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, or brand..."
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Category Filter</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Category Filter"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadIcon />}
              fullWidth
            >
              Import
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              fullWidth
            >
              Export
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Filtered Products Count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase())
          ).filter(p => !filterCategory || p.category === filterCategory).length} of {products.length} products
        </Typography>
      </Box>

      {products.length === 0 && !loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by adding your first product using the "ADD PRODUCT" button above.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'auto' }}>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  product.brand.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .filter(product => !filterCategory || product.category === filterCategory)
                .sort((a, b) => {
                  switch (sortBy) {
                    case 'name': return a.name.localeCompare(b.name);
                    case 'price': return a.price - b.price;
                    case 'quantity': return a.quantity - b.quantity;
                    case 'category': return a.category.localeCompare(b.category);
                    default: return 0;
                  }
                })
                .map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.size}</TableCell>
                  <TableCell>{product.color}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>
                    {product.quantity === 0 ? (
                      <Chip label="Out of Stock" color="error" size="small" />
                    ) : product.quantity <= 5 ? (
                      <Chip label="Low Stock" color="warning" size="small" />
                    ) : (
                      <Chip label="In Stock" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {(user?.role === 'admin' || user?.role === 'inventory') && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleDialogOpen(product)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(product._id)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField 
            label="Name" 
            name="name" 
            value={form.name} 
            onChange={handleFormChange} 
            fullWidth 
            required 
          />
          <TextField 
            label="SKU" 
            name="sku" 
            value={form.sku} 
            onChange={handleFormChange} 
            fullWidth 
            required 
          />
          <TextField 
            label="Brand" 
            name="brand" 
            value={form.brand} 
            onChange={handleFormChange} 
            fullWidth 
            required 
          />
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select 
              name="category" 
              value={form.category} 
              onChange={handleFormChange}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Size</InputLabel>
            <Select 
              name="size" 
              value={form.size} 
              onChange={handleFormChange}
              label="Size"
            >
              {sizes.map((sz) => (
                <MenuItem key={sz} value={sz}>{sz}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField 
            label="Color" 
            name="color" 
            value={form.color} 
            onChange={handleFormChange} 
            fullWidth 
            required 
          />
          <TextField 
            label="Quantity" 
            name="quantity" 
            type="number" 
            value={form.quantity} 
            onChange={handleFormChange} 
            fullWidth 
            required 
          />
          <TextField 
            label="Price" 
            name="price" 
            type="number" 
            value={form.price} 
            onChange={handleFormChange} 
            fullWidth 
            required 
          />
          <TextField 
            label="Cost Price" 
            name="costPrice" 
            type="number" 
            value={form.costPrice} 
            onChange={handleFormChange} 
            fullWidth 
            required 
          />
          <TextField 
            label="Description" 
            name="description" 
            value={form.description} 
            onChange={handleFormChange} 
            fullWidth 
            multiline 
            rows={2} 
          />

          {/* Image Upload */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Product Image
            </Typography>
            <Box sx={{
              border: '2px dashed #ccc',
              borderRadius: 1,
              p: 2,
              textAlign: 'center',
              position: 'relative',
              minHeight: 120,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click to upload product image
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (editingProduct ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagementPage; 