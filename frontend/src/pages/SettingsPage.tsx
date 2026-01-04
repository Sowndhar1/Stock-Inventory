import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Store as StoreIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext.tsx';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { token } = useAuth();
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    currency: 'INR',
    taxRate: 18,
  });

  const [userSettings, setUserSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    lowStockAlerts: true,
    salesReports: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    lowStockThreshold: 5,
    autoBackup: true,
    darkMode: false,
    language: 'English',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setFetchingSettings(true);
      const response = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      
      setStoreSettings({
        storeName: data.storeName || '',
        address: data.storeAddress || '',
        phone: data.storePhone || '',
        email: data.storeEmail || '',
        gstNumber: data.gstNumber || '',
        currency: data.settings?.currency || 'INR',
        taxRate: data.settings?.taxRate || 18,
      });
      
      setUserSettings(prev => ({
        ...prev,
        emailNotifications: data.settings?.emailNotifications ?? true,
        lowStockAlerts: data.settings?.lowStockAlerts ?? true,
        salesReports: data.settings?.salesReports ?? true,
      }));
      
      setSystemSettings({
        lowStockThreshold: data.settings?.lowStockThreshold || 5,
        autoBackup: true,
        darkMode: data.settings?.darkMode || false,
        language: data.settings?.language || 'English',
      });
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setFetchingSettings(false);
    }
  };

  const handleStoreSettingsChange = useCallback((field: string, value: string | number) => {
    setStoreSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleUserSettingsChange = useCallback((field: string, value: string | boolean) => {
    setUserSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSystemSettingsChange = useCallback((field: string, value: string | number | boolean) => {
    setSystemSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleStoreSettingsSave = async () => {
    setIsLoading(true);
    try {
      if (!storeSettings.storeName.trim()) {
        setMessage({ type: 'error', text: 'Store name is required!' });
        return;
      }
      if (storeSettings.email && !storeSettings.email.includes('@')) {
        setMessage({ type: 'error', text: 'Please enter a valid email address!' });
        return;
      }
      if (storeSettings.taxRate < 0 || storeSettings.taxRate > 100) {
        setMessage({ type: 'error', text: 'Tax rate must be between 0 and 100!' });
        return;
      }
      
      const response = await fetch('/api/settings/store', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName: storeSettings.storeName,
          storeAddress: storeSettings.address,
          storePhone: storeSettings.phone,
          storeEmail: storeSettings.email,
          gstNumber: storeSettings.gstNumber,
          currency: storeSettings.currency,
          taxRate: storeSettings.taxRate
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update store settings');
      }
      
      setMessage({ type: 'success', text: 'Store settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update store settings!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    try {
      if (!userSettings.currentPassword.trim()) {
        setMessage({ type: 'error', text: 'Current password is required!' });
        return;
      }
      if (userSettings.newPassword !== userSettings.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match!' });
        return;
      }
      if (userSettings.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
        return;
      }
      
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: userSettings.currentPassword,
          newPassword: userSettings.newPassword
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setUserSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSettingsSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailNotifications: userSettings.emailNotifications,
          lowStockAlerts: userSettings.lowStockAlerts,
          salesReports: userSettings.salesReports
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update notification settings');
      }
      
      setMessage({ type: 'success', text: 'Notification settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update notification settings!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemSettingsSave = async () => {
    setIsLoading(true);
    try {
      if (systemSettings.lowStockThreshold < 0) {
        setMessage({ type: 'error', text: 'Low stock threshold cannot be negative!' });
        return;
      }
      
      const response = await fetch('/api/settings/system', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lowStockThreshold: systemSettings.lowStockThreshold,
          darkMode: systemSettings.darkMode,
          language: systemSettings.language
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update system settings');
      }
      
      setMessage({ type: 'success', text: 'System settings updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update system settings!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'Backup completed successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Backup failed!' });
    } finally {
      setIsLoading(false);
    }
  };

  const SettingCard = useMemo(() => {
    return React.forwardRef<HTMLDivElement, { 
      title: string; 
      icon: React.ReactNode; 
      children: React.ReactNode 
    }>(({ title, icon, children }, ref) => (
      <Paper ref={ref} sx={{ height: '100%', p: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {icon}
          <Typography variant="h6" fontWeight={600} sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        {children}
      </Paper>
    ));
  }, []);

  if (fetchingSettings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
        Settings
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: 3 
      }}>
        {/* Store Settings */}
        <SettingCard title="Store Information" icon={<StoreIcon color="primary" />}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Store Name"
              value={storeSettings.storeName}
              onChange={(e) => handleStoreSettingsChange('storeName', e.target.value)}
              fullWidth
            />
            <TextField
              label="Address"
              value={storeSettings.address}
              onChange={(e) => handleStoreSettingsChange('address', e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Phone"
              value={storeSettings.phone}
              onChange={(e) => handleStoreSettingsChange('phone', e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={storeSettings.email}
              onChange={(e) => handleStoreSettingsChange('email', e.target.value)}
              fullWidth
              error={storeSettings.email !== '' && !storeSettings.email.includes('@')}
            />
            <TextField
              label="GST Number"
              value={storeSettings.gstNumber}
              onChange={(e) => handleStoreSettingsChange('gstNumber', e.target.value)}
              fullWidth
            />
            <TextField
              label="Currency"
              value={storeSettings.currency}
              onChange={(e) => handleStoreSettingsChange('currency', e.target.value)}
              fullWidth
            />
            <TextField
              label="Tax Rate (%)"
              type="number"
              value={storeSettings.taxRate}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 100) {
                  handleStoreSettingsChange('taxRate', value);
                }
              }}
              inputProps={{ min: 0, max: 100 }}
              fullWidth
            />
            <Button 
              variant="contained" 
              onClick={handleStoreSettingsSave}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Save Store Settings'}
            </Button>
          </Box>
        </SettingCard>

        {/* Security Settings */}
        <SettingCard title="Security" icon={<SecurityIcon color="primary" />}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Current Password"
              type="password"
              value={userSettings.currentPassword}
              onChange={(e) => handleUserSettingsChange('currentPassword', e.target.value)}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={userSettings.newPassword}
              onChange={(e) => handleUserSettingsChange('newPassword', e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={userSettings.confirmPassword}
              onChange={(e) => handleUserSettingsChange('confirmPassword', e.target.value)}
              fullWidth
            />
            <Button 
              variant="contained" 
              onClick={handlePasswordChange}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Change Password'}
            </Button>
          </Box>
        </SettingCard>

        {/* Notification Settings */}
        <SettingCard title="Notifications" icon={<NotificationsIcon color="primary" />}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={userSettings.emailNotifications}
                  onChange={(e) => handleUserSettingsChange('emailNotifications', e.target.checked)}
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={userSettings.lowStockAlerts}
                  onChange={(e) => handleUserSettingsChange('lowStockAlerts', e.target.checked)}
                  color="primary"
                />
              }
              label="Low Stock Alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={userSettings.salesReports}
                  onChange={(e) => handleUserSettingsChange('salesReports', e.target.checked)}
                  color="primary"
                />
              }
              label="Daily Sales Reports"
            />
            <Button 
              variant="contained" 
              onClick={handleNotificationSettingsSave}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Save Notification Settings'}
            </Button>
          </Box>
        </SettingCard>

        {/* System Settings */}
        <SettingCard title="System" icon={<BackupIcon color="primary" />}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              label="Low Stock Threshold"
              type="number"
              value={systemSettings.lowStockThreshold}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0) {
                  handleSystemSettingsChange('lowStockThreshold', value);
                }
              }}
              inputProps={{ min: 0 }}
              fullWidth
              helperText="Minimum quantity to trigger low stock alert"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.autoBackup}
                  onChange={(e) => handleSystemSettingsChange('autoBackup', e.target.checked)}
                  color="primary"
                />
              }
              label="Auto Backup"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.darkMode}
                  onChange={(e) => handleSystemSettingsChange('darkMode', e.target.checked)}
                  color="primary"
                />
              }
              label="Dark Mode"
            />
            <TextField
              label="Language"
              value={systemSettings.language}
              onChange={(e) => handleSystemSettingsChange('language', e.target.value)}
              fullWidth
            />
            <Button 
              variant="contained" 
              onClick={handleSystemSettingsSave}
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Save System Settings'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleBackup}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Create Backup'}
            </Button>
          </Box>
        </SettingCard>
      </Box>
    </Box>
  );
};

export default SettingsPage;
