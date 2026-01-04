import React, { useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Print, Download, Close } from '@mui/icons-material';

interface InvoiceItem {
  product: {
    name: string;
    sku: string;
    price: number;
  };
  quantity: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  storeInfo: {
    name: string;
    address: string;
    phone: string;
    gstNumber: string;
  };
}

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ open, onClose, invoiceData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${invoiceData.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .store-info { margin-bottom: 20px; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                th { background-color: #f5f5f5; }
                .totals { text-align: right; margin-top: 20px; }
                .footer { margin-top: 40px; text-align: center; font-size: 12px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownload = () => {
    // Generate PDF download (you can use jsPDF or similar library)
    console.log('Download functionality - implement with jsPDF');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h6">Invoice #{invoiceData.invoiceNumber}</Typography>
        <Box>
          <Button
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ color: 'white', mr: 1 }}
          >
            Print
          </Button>
          <Button
            startIcon={<Download />}
            onClick={handleDownload}
            sx={{ color: 'white', mr: 1 }}
          >
            Download
          </Button>
          <Button
            startIcon={<Close />}
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            Close
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box ref={printRef}>
          {/* Invoice Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" fontWeight={700} color="primary">
              {invoiceData.storeInfo.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {invoiceData.storeInfo.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: {invoiceData.storeInfo.phone} | GST: {invoiceData.storeInfo.gstNumber}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Invoice Details */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 3,
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2
          }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>Bill To:</Typography>
              <Typography variant="body1">{invoiceData.customerName}</Typography>
            </Box>
            <Box sx={{ textAlign: isMobile ? 'left' : 'right' }}>
              <Typography variant="body2">
                <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {invoiceData.date}
              </Typography>
            </Box>
          </Box>

          {/* Items Table */}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.product.sku}</TableCell>
                  <TableCell align="right">₹{item.product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">₹{item.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <Box sx={{ textAlign: 'right', mt: 3 }}>
            <Typography variant="body1">
              <strong>Subtotal:</strong> ₹{invoiceData.subtotal.toFixed(2)}
            </Typography>
            <Typography variant="body1">
              <strong>Tax (18%):</strong> ₹{invoiceData.tax.toFixed(2)}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" fontWeight={700} color="primary">
              <strong>Total:</strong> ₹{invoiceData.total.toFixed(2)}
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Thank you for your business!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This is a computer generated invoice
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal; 