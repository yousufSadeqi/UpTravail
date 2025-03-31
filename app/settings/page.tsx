'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, Shield, CreditCard, User, Mail, Phone, MapPin, 
  Globe, DollarSign, Clock, Lock, BellRing, Home, Briefcase,
  Search, ChevronDown, Menu, Star, Settings as SettingsIcon,
  Camera, Link2, Eye, EyeOff, X, Building
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface ConnectedAccount {
  id: string;
  provider: 'google' | 'facebook' | 'github';
  email: string;
  connected: boolean;
}

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  profession: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  hourlyRate?: number;
  availability: {
    status: 'available' | 'unavailable';
    nextAvailableDate?: string;
  };
  jobPreferences: {
    types: ('hourly' | 'fixed-price')[];
    categories: string[];
  };
}

interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  cardholderName: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  lastFour: string;
  isDefault: boolean;
  accountHolderName: string;
}

interface PayPalAccount {
  id: string;
  email: string;
  isDefault: boolean;
  isVerified: boolean;
}

type PaymentMethod = PaymentCard | BankAccount | PayPalAccount;

interface BillingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId?: string;
}

interface SettingsSection {
  id: TabType;
  label: string;
  icon: JSX.Element;
  description: string;
}

type TabType = 'overview' | 'security' | 'profile' | 'privacy' | 'notifications' | 'payments' | 'integrations';

interface SecurityMetrics {
  lastLogin: {
    timestamp: string;
    device: string;
    location: string;
    browser: string;
  };
  trustedDevices: Array<{
    id: string;
    name: string;
    lastUsed: string;
    isCurrent: boolean;
  }>;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  recoveryEmail?: string;
  backupCodes: number;
}

interface SmartRecommendation {
  id: string;
  type: 'job_posting' | 'profile_update' | 'security' | 'payment';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface DashboardLayout {
  sections: Array<{
    id: string;
    visible: boolean;
    order: number;
  }>;
}

interface SecuritySettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  preferredMethod: '2fa_app' | 'sms' | 'email';
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  channels: NotificationChannel;
}

// Add new interfaces for card validation
interface CardValidation {
  isValid: boolean;
  type: 'visa' | 'mastercard' | 'amex' | null;
  error?: string;
}

// Add helper functions for card validation
const validateCardNumber = (number: string): CardValidation => {
  const cardNumber = number.replace(/\s+/g, '');
  
  // Basic Luhn algorithm check
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  // Determine card type
  let type: CardValidation['type'] = null;
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cardNumber)) {
    type = 'visa';
  } else if (/^5[1-5][0-9]{14}$/.test(cardNumber)) {
    type = 'mastercard';
  } else if (/^3[47][0-9]{13}$/.test(cardNumber)) {
    type = 'amex';
  }

  return {
    isValid: sum % 10 === 0 && cardNumber.length >= 13,
    type,
    error: !type ? 'Invalid card type' : 
           sum % 10 !== 0 ? 'Invalid card number' : undefined
  };
};

const validateExpiryDate = (date: string): boolean => {
  const [month, year] = date.split('/').map(num => parseInt(num));
  if (!month || !year) return false;

  const expiry = new Date(2000 + year, month - 1);
  const today = new Date();
  return expiry > today;
};

const validateCVV = (cvv: string, cardType: string): boolean => {
  const cvvLength = cardType === 'amex' ? 4 : 3;
  return cvv.length === cvvLength && /^\d+$/.test(cvv);
};

interface PaymentFormData {
  type: 'card' | 'bank' | 'paypal';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  email: string;
}

// Add validation functions for bank account
const validateBankAccount = (accountNumber: string): boolean => {
  // Basic validation - should be 8-17 digits
  return /^\d{8,17}$/.test(accountNumber);
};

const validateRoutingNumber = (routingNumber: string): boolean => {
  // Basic ABA routing number validation - 9 digits
  return /^\d{9}$/.test(routingNumber);
};

const validatePayPalEmail = (email: string): boolean => {
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Add new interface for database payment methods
interface DBPaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'bank' | 'paypal';
  details: {
    type?: 'visa' | 'mastercard' | 'amex';
    lastFour?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardholderName?: string;
    bankName?: string;
    accountType?: string;
    email?: string;
    isVerified?: boolean;
  };
  is_default: boolean;
}

export default function SettingsPage() {
  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Briefcase className="w-5 h-5" />, label: 'My Jobs', href: '/my-jobs', count: 3 },
    { icon: <Search className="w-5 h-5" />, label: 'Find Jobs', href: '/find-jobs' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Earnings', href: '/earnings' },
    { icon: <Star className="w-5 h-5" />, label: 'Reviews', href: '/reviews' },
    { icon: <SettingsIcon className="w-5 h-5" />, label: 'Settings', href: '/settings' },
  ];

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const [notifications] = useState<NotificationSetting[]>([
    {
      id: 'new_jobs',
      title: 'New Job Matches',
      description: 'Get notified when new jobs match your skills and preferences',
      enabled: true
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Receive notifications for new messages from clients',
      enabled: true
    },
    {
      id: 'job_updates',
      title: 'Job Updates',
      description: 'Get updates about your ongoing jobs',
      enabled: true
    }
  ]);

  const [connectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: 'google',
      provider: 'google',
      email: 'john@gmail.com',
      connected: true
    },
    {
      id: 'facebook',
      provider: 'facebook',
      email: 'john.doe@facebook.com',
      connected: false
    },
    {
      id: 'github',
      provider: 'github',
      email: 'johndoe@github.com',
      connected: true
    }
  ]);

  const [privacySettings] = useState<PrivacySetting[]>([
    {
      id: 'profile_visibility',
      title: 'Profile Visibility',
      description: 'Make your profile visible to potential clients',
      enabled: true
    },
    {
      id: 'show_earnings',
      title: 'Show Earnings',
      description: 'Display your earnings history on your public profile',
      enabled: false
    },
    {
      id: 'show_reviews',
      title: 'Show Reviews',
      description: 'Display client reviews on your public profile',
      enabled: true
    }
  ]);

  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: '',
    skills: ['Plumbing', 'Installation', 'Repair'],
    profession: 'Plumber',
    experience: 'intermediate',
    hourlyRate: 25,
    availability: {
      status: 'available',
      nextAvailableDate: new Date().toISOString().split('T')[0]
    },
    jobPreferences: {
      types: ['hourly', 'fixed-price'],
      categories: ['Plumbing', 'Maintenance']
    }
  });

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  });

  const settingsSections: SettingsSection[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <User className="w-5 h-5" />,
      description: 'Manage your account information and preferences'
    },
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: <User className="w-5 h-5" />,
      description: 'Update your professional profile and skills'
    },
    {
      id: 'privacy',
      label: 'Privacy Settings',
      icon: <Eye className="w-5 h-5" />,
      description: 'Control your privacy and data sharing preferences'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Manage your notification preferences'
    },
    {
      id: 'payments',
      label: 'Payment Settings',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Update your payment methods and billing information'
    },
    {
      id: 'integrations',
      label: 'Integrations',
      icon: <Link2 className="w-5 h-5" />,
      description: 'Connect with third-party services and apps'
    }
  ];

  const getProviderIcon = (provider: ConnectedAccount['provider']) => {
    switch (provider) {
      case 'google':
        return <Mail className="w-5 h-5" />;
      case 'facebook':
        return <Globe className="w-5 h-5" />;
      case 'github':
        return <Link2 className="w-5 h-5" />;
    }
  };

  const handleProfileUpdate = async (updates: Partial<ProfileSettings>) => {
    setProfileSettings(prev => ({ ...prev, ...updates }));
    // TODO: API call to update profile
  };

  const handlePaymentMethodAdd = async (method: Omit<PaymentMethod, 'id'>) => {
    // TODO: API call to add payment method
    setPaymentMethods(prev => [...prev, { ...method, id: Date.now().toString() }]);
  };

  const handleBillingUpdate = async (updates: Partial<BillingInfo>) => {
    setBillingInfo(prev => ({ ...prev, ...updates }));
    // TODO: API call to update billing info
  };

  const handleProfilePictureUpload = async (file: File) => {
    // TODO: API call to upload profile picture
    console.log('Uploading profile picture:', file);
  };

  const handleNotificationToggle = async (id: string, enabled: boolean) => {
    // TODO: API call to update notification preferences
    console.log('Toggling notification:', { id, enabled });
  };

  const handlePrivacyToggle = async (id: string, enabled: boolean) => {
    // TODO: API call to update privacy settings
    console.log('Toggling privacy setting:', { id, enabled });
  };

  const handleIntegrationToggle = async (provider: string, connect: boolean) => {
    // TODO: API call to connect/disconnect integration
    console.log('Toggling integration:', { provider, connect });
  };

  const validateProfileForm = (data: Partial<ProfileSettings>) => {
    const errors: Record<string, string> = {};
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Invalid email address';
    }
    if (data.phone && !/^\+\d{1,3}\s?\(\d{3}\)\s?\d{3}-\d{4}$/.test(data.phone)) {
      errors.phone = 'Invalid phone number format';
    }
    return errors;
  };

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    preferredMethod: '2fa_app'
  });

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome 98.0',
      location: 'New York, USA',
      lastActive: new Date().toISOString(),
      isCurrent: true
    },
    {
      id: '2',
      device: 'iPhone 13',
      browser: 'Safari Mobile',
      location: 'New York, USA',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      isCurrent: false
    }
  ]);

  const [errors, setErrors] = useState<Partial<SecuritySettings>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = () => {
    const newErrors: Partial<SecuritySettings> = {};

    if (!securitySettings.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (securitySettings.newPassword) {
      if (securitySettings.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (securitySettings.newPassword !== securitySettings.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      // TODO: Implement API call to update security settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      console.log('Security settings updated:', securitySettings);
      // Show success message
    } catch (error) {
      console.error('Failed to update security settings:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionLogout = async (sessionId: string) => {
    try {
      // TODO: Implement API call to terminate session
      setActiveSessions(sessions => 
        sessions.filter(session => session.id !== sessionId)
      );
      // Show success message
    } catch (error) {
      console.error('Failed to terminate session:', error);
      // Show error message
    }
  };

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    {
      id: 'job_updates',
      title: 'Job Updates',
      description: 'Get notified about new job offers, status changes, and deadlines',
      channels: { email: true, sms: true, push: true }
    },
    {
      id: 'payments',
      title: 'Payment Updates',
      description: 'Receive notifications about payments, invoices, and billing',
      channels: { email: true, sms: false, push: true }
    },
    {
      id: 'messages',
      title: 'Messages',
      description: 'Get notified when you receive new messages from clients',
      channels: { email: true, sms: true, push: true }
    },
    {
      id: 'promotional',
      title: 'Promotional Updates',
      description: 'Stay updated with platform news, tips, and special offers',
      channels: { email: true, sms: false, push: false }
    }
  ]);

  const handleNotificationUpdate = async (
    preferenceId: string,
    channel: keyof NotificationChannel,
    enabled: boolean
  ) => {
    setNotificationPreferences(preferences =>
      preferences.map(pref =>
        pref.id === preferenceId
          ? { ...pref, channels: { ...pref.channels, [channel]: enabled } }
          : pref
      )
    );
  };

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<PaymentFormData>({
    type: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    email: ''
  });

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Add new state for loading
  const [isProcessing, setIsProcessing] = useState(false);

  // Add new state for confirmation dialogs
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: 'remove' | 'default';
    paymentId: string;
    paymentType: string;
    lastFour: string;
  } | null>(null);

  // Add function to fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      const { data: methods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!methods) {
        setPaymentMethods([]);
        return;
      }

      const transformedMethods = methods.map(method => {
        if (method.type === 'card') {
          return {
            id: method.id,
            type: method.details.type,
            lastFour: method.details.lastFour,
            expiryMonth: method.details.expiryMonth,
            expiryYear: method.details.expiryYear,
            isDefault: method.is_default,
            cardholderName: method.details.cardholderName
          } as PaymentCard;
        } else if (method.type === 'bank') {
          return {
            id: method.id,
            bankName: method.details.bankName,
            accountType: method.details.accountType || 'checking',
            lastFour: method.details.lastFour,
            isDefault: method.is_default,
            accountHolderName: method.details.accountHolderName
          } as BankAccount;
        } else {
          return {
            id: method.id,
            email: method.details.email,
            isDefault: method.is_default,
            isVerified: method.details.isVerified
          } as PayPalAccount;
        }
      });

      setPaymentMethods(transformedMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      showNotification('error', 'Failed to load payment methods');
    }
  };

  // Add useEffect to fetch payment methods on component mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Update handleAddPayment to store in database
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      let paymentData = {
        type: newPayment.type,
        details: {},
        is_default: paymentMethods.length === 0
      };

      if (newPayment.type === 'paypal') {
        if (!validatePayPalEmail(newPayment.email)) {
          showNotification('error', 'Please enter a valid PayPal email');
          return;
        }

        paymentData.details = {
          email: newPayment.email,
          isVerified: true
        };
      } else if (newPayment.type === 'card') {
        const cardValidation = validateCardNumber(newPayment.cardNumber);
        if (!cardValidation.isValid) {
          showNotification('error', cardValidation.error || 'Invalid card number');
          return;
        }

        paymentData.details = {
          type: cardValidation.type,
          lastFour: newPayment.cardNumber.slice(-4),
          expiryMonth: newPayment.expiryDate.split('/')[0],
          expiryYear: newPayment.expiryDate.split('/')[1],
          cardholderName: newPayment.cardholderName
        };
      } else if (newPayment.type === 'bank') {
        if (!validateBankAccount(newPayment.accountNumber)) {
          showNotification('error', 'Invalid account number');
          return;
        }

        paymentData.details = {
          bankName: newPayment.bankName,
          accountType: 'checking',
          lastFour: newPayment.accountNumber.slice(-4),
          accountHolderName: newPayment.cardholderName
        };
      }

      const { error } = await supabase
        .from('payment_methods')
        .insert(paymentData);

      if (error) {
        console.error('Error saving payment method:', error);
        throw error;
      }

      await fetchPaymentMethods();
      setShowAddPayment(false);
      showNotification('success', 'Payment method added successfully');

    } catch (error) {
      console.error('Error in handleAddPayment:', error);
      showNotification('error', 'Failed to add payment method');
    } finally {
      setIsProcessing(false);
      setNewPayment({
        type: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        email: ''
      });
    }
  };

  // Update handleSetDefaultPayment
  const handleConfirmAction = async () => {
    if (!confirmationDialog) return;

    const { type, paymentId } = confirmationDialog;
    setIsProcessing(true);

    try {
      if (type === 'remove') {
        const { error } = await supabase
          .from('payment_methods')
          .delete()
          .eq('id', paymentId);

        if (error) throw error;
        await fetchPaymentMethods();
        showNotification('success', 'Payment method removed successfully');
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .neq('id', paymentId);

        if (error) throw error;

        const { error: error2 } = await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', paymentId);

        if (error2) throw error2;

        await fetchPaymentMethods();
        showNotification('success', 'Default payment method updated');
      }
    } catch (error) {
      showNotification('error', `Failed to ${type === 'remove' ? 'remove' : 'update'} payment method`);
    } finally {
      setIsProcessing(false);
      setConfirmationDialog(null);
    }
  };

  const handleSetDefaultPayment = async (id: string) => {
    const payment = paymentMethods.find(m => m.id === id);
    if (!payment) return;

    const paymentType = 'type' in payment ? payment.type : 
                       'bankName' in payment ? 'bank account' : 'PayPal';
    const lastFour = 'lastFour' in payment ? payment.lastFour :
                     'email' in payment ? payment.email.slice(-4) : '';

    setConfirmationDialog({
      isOpen: true,
      type: 'default',
      paymentId: id,
      paymentType,
      lastFour
    });
  };

  const handleDeletePayment = async (id: string) => {
    const payment = paymentMethods.find(m => m.id === id);
    if (!payment) return;

    const paymentType = 'type' in payment ? payment.type : 
                       'bankName' in payment ? 'bank account' : 'PayPal';
    const lastFour = 'lastFour' in payment ? payment.lastFour :
                     'email' in payment ? payment.email.slice(-4) : '';

    setConfirmationDialog({
      isOpen: true,
      type: 'remove',
      paymentId: id,
      paymentType,
      lastFour
    });
  };

  // Add new state for profile image
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Add new state for new skill
  const [newSkill, setNewSkill] = useState('');

  // Add new state for input styles
  const inputStyles = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary';

  // Add new function to handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // First, delete existing profile image if any
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_image_url')
        .eq('id', user.id)
        .single();

      if (profile?.profile_image_url) {
        const oldFilePath = profile.profile_image_url.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from('profile-images')
            .remove([oldFilePath]);
        }
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update UI
      setProfileImage(publicUrl);

      // Update all profile images in the UI
      const profileImages = document.querySelectorAll('.profile-image');
      profileImages.forEach(element => {
        if (element instanceof HTMLImageElement) {
          element.src = publicUrl;
        }
      });

      showNotification('success', 'Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('error', 'Failed to upload image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add new function to handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      handleProfileUpdate({ skills: [...profileSettings.skills, newSkill] });
      setNewSkill('');
    }
  };

  // Add new function to handle removing a skill
  const handleRemoveSkill = (skill: string) => {
    handleProfileUpdate({ skills: profileSettings.skills.filter(s => s !== skill) });
  };

  // Add new function to handle saving the profile
  const handleSaveProfile = async () => {
    if (!validateProfileForm(profileSettings)) return;

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileSettings.fullName,
          email: profileSettings.email,
          phone: profileSettings.phone,
          location: profileSettings.location,
          bio: profileSettings.bio,
          skills: profileSettings.skills,
          profession: profileSettings.profession,
          experience: profileSettings.experience,
          hourly_rate: profileSettings.hourlyRate,
          availability_status: profileSettings.availability.status,
          next_available_date: profileSettings.availability.nextAvailableDate,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update UI
      const nameElements = document.querySelectorAll('.user-name');
      nameElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.textContent = profileSettings.fullName;
        }
      });

      showNotification('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showNotification('error', 'Failed to update profile');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add useEffect to fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setProfileSettings({
            fullName: profile.full_name || '',
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            bio: profile.bio || '',
            skills: profile.skills || [],
            profession: profile.profession || '',
            experience: profile.experience || 'beginner',
            hourlyRate: profile.hourly_rate || 0,
            availability: {
              status: profile.availability_status || 'available',
              nextAvailableDate: profile.next_available_date || new Date().toISOString().split('T')[0]
            },
            jobPreferences: {
              types: ['hourly', 'fixed-price'],
              categories: []
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification('error', 'Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 user-name sidebar-name">
                {profileSettings.fullName || 'John Doe'}
              </h3>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                  item.label === 'Settings'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count && (
                  <span className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    {item.count}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex-1 flex items-center gap-4">
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-600 hover:text-gray-900">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {/* Settings Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Settings Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id as TabType)}
                className={`p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                  activeTab === section.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2 rounded-lg ${
                    activeTab === section.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {section.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">{section.label}</h3>
                </div>
                <p className="text-sm text-gray-500 text-left">{section.description}</p>
              </button>
            ))}
          </div>

          {/* Active Section Content */}
          {activeTab && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {settingsSections.find(s => s.id === activeTab)?.label}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {settingsSections.find(s => s.id === activeTab)?.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {activeTab === 'overview' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-600" />
                        </div>
                        <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
                          <Camera className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">John Doe</h2>
                        <p className="text-sm text-gray-500">Professional Plumber</p>
                        <p className="text-sm text-gray-500">New York, NY</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>john@example.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>New York, NY</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-4">
                      <button 
                        onClick={() => setActiveTab('security')}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-primary" />
                          <span className="font-medium text-gray-900">Security Settings</span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('notifications')}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <BellRing className="w-5 h-5 text-primary" />
                          <span className="font-medium text-gray-900">Notification Preferences</span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      <button 
                        onClick={() => setActiveTab('payments')}
                        className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <span className="font-medium text-gray-900">Payment Methods</span>
                        </div>
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Basic Profile Info */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden">
                            {profileImage ? (
                              <Image
                                src={profileImage}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => document.getElementById('profile-image')?.click()}
                            className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full hover:bg-primary/90"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                          <input
                            type="file"
                            id="profile-image"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileSettings.fullName}
                              onChange={(e) => handleProfileUpdate({ fullName: e.target.value })}
                              className={inputStyles}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Profession
                            </label>
                            <select
                              value={profileSettings.profession}
                              onChange={(e) => handleProfileUpdate({ profession: e.target.value })}
                              className={inputStyles}
                            >
                              <option value="plumber">Plumber</option>
                              <option value="electrician">Electrician</option>
                              <option value="carpenter">Carpenter</option>
                              <option value="painter">Painter</option>
                              <option value="hvac">HVAC Technician</option>
                              {/* Add more professions */}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Experience Level
                          </label>
                          <select
                            value={profileSettings.experience}
                            onChange={(e) => handleProfileUpdate({ experience: e.target.value })}
                            className={inputStyles}
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rate (Optional)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={profileSettings.hourlyRate || ''}
                              onChange={(e) => handleProfileUpdate({ hourlyRate: parseFloat(e.target.value) })}
                              className={`${inputStyles} pl-8`}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Skills Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Skills & Specializations
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {profileSettings.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                            >
                              {skill}
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:text-primary/70"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            className={inputStyles}
                            placeholder="Add a skill"
                          />
                          <button
                            onClick={handleAddSkill}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Availability Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Availability Status
                        </label>
                        <div className="flex items-center gap-4">
                          <select
                            value={profileSettings.availability.status}
                            onChange={(e) => handleProfileUpdate({
                              availability: {
                                ...profileSettings.availability,
                                status: e.target.value as 'available' | 'unavailable'
                              }
                            })}
                            className={inputStyles}
                          >
                            <option value="available">Available for Work</option>
                            <option value="unavailable">Currently Unavailable</option>
                          </select>
                          {profileSettings.availability.status === 'unavailable' && (
                            <input
                              type="date"
                              value={profileSettings.availability.nextAvailableDate}
                              onChange={(e) => handleProfileUpdate({
                                availability: {
                                  ...profileSettings.availability,
                                  nextAvailableDate: e.target.value
                                }
                              })}
                              className={inputStyles}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isProcessing}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isProcessing ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  {/* Password Change Section */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={securitySettings.currentPassword}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            currentPassword: e.target.value
                          })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                            errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.currentPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={securitySettings.newPassword}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            newPassword: e.target.value
                          })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                            errors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.newPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={securitySettings.confirmPassword}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            confirmPassword: e.target.value
                          })}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication Section */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={securitySettings.twoFactorEnabled}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            twoFactorEnabled: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {securitySettings.twoFactorEnabled && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred 2FA Method
                        </label>
                        <select
                          value={securitySettings.preferredMethod}
                          onChange={(e) => setSecuritySettings({
                            ...securitySettings,
                            preferredMethod: e.target.value as SecuritySettings['preferredMethod']
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <option value="2fa_app">Authenticator App</option>
                          <option value="sms">SMS</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions Section */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-4">
                      {activeSessions.map((session) => (
                        <div 
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{session.device}</span>
                              {session.isCurrent && (
                                <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {session.browser} • {session.location}
                            </p>
                            <p className="text-xs text-gray-400">
                              Last active: {new Date(session.lastActive).toLocaleString()}
                            </p>
                          </div>
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleSessionLogout(session.id)}
                              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              Logout
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                        <p className="text-sm text-gray-500">Choose how you want to receive updates</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {notificationPreferences.map((preference) => (
                        <div
                          key={preference.id}
                          className="p-4 bg-gray-50 rounded-lg space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{preference.title}</h4>
                              <p className="text-sm text-gray-500">{preference.description}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Email</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={preference.channels.email}
                                  onChange={(e) => handleNotificationUpdate(
                                    preference.id,
                                    'email',
                                    e.target.checked
                                  )}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">SMS</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={preference.channels.sms}
                                  onChange={(e) => handleNotificationUpdate(
                                    preference.id,
                                    'sms',
                                    e.target.checked
                                  )}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <div className="flex items-center gap-2">
                                <BellRing className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Push</span>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={preference.channels.push}
                                  onChange={(e) => handleNotificationUpdate(
                                    preference.id,
                                    'push',
                                    e.target.checked
                                  )}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Changes Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          // TODO: Implement API call to save notification preferences
                          await new Promise(resolve => setTimeout(resolve, 1000));
                          showNotification('success', 'Notification preferences updated successfully');
                        } catch (error) {
                          showNotification('error', 'Failed to update notification preferences');
                        }
                      }}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-8">
                  {/* Saved Payment Methods */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                        <p className="text-sm text-gray-500">Manage your payment options</p>
                      </div>
                      <button
                        onClick={() => setShowAddPayment(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Add New Method
                      </button>
                    </div>

                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`p-4 rounded-lg border ${
                            method.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Payment Method Icon */}
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                {'type' in method ? (
                                  <CreditCard className="w-6 h-6 text-gray-600" />
                                ) : 'bankName' in method ? (
                                  <Building className="w-6 h-6 text-gray-600" />
                                ) : (
                                  <Globe className="w-6 h-6 text-gray-600" />
                                )}
                              </div>

                              {/* Payment Method Details */}
                              <div>
                                {'type' in method ? (
                                  <>
                                    <p className="font-medium text-gray-900">
                                      {method.type.toUpperCase()} •••• {method.lastFour}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Expires {method.expiryMonth}/{method.expiryYear}
                                    </p>
                                  </>
                                ) : 'bankName' in method ? (
                                  <>
                                    <p className="font-medium text-gray-900">{method.bankName}</p>
                                    <p className="text-sm text-gray-500">
                                      {method.accountType.charAt(0).toUpperCase() + method.accountType.slice(1)} •••• {method.lastFour}
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="font-medium text-gray-900">PayPal</p>
                                    <p className="text-sm text-gray-500">{method.email}</p>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              {/* Default Badge */}
                              {method.isDefault && (
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                  Default
                                </span>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {!method.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultPayment(method.id)}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeletePayment(method.id)}
                                  className="text-sm text-red-600 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add New Payment Method Modal */}
                  {showAddPayment && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Add Payment Method</h3>
                          <button
                            onClick={() => setShowAddPayment(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleAddPayment} className="space-y-6">
                          {/* Payment Type Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Payment Type
                            </label>
                            <select
                              value={newPayment.type}
                              onChange={(e) => {
                                const value = e.target.value as 'card' | 'bank' | 'paypal';
                                setNewPayment({ ...newPayment, type: value });
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              <option value="card">Credit/Debit Card</option>
                              <option value="bank">Bank Account</option>
                              <option value="paypal">PayPal</option>
                            </select>
                          </div>

                          {/* Card Details */}
                          {newPayment.type === 'card' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Card Number
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    maxLength={19}
                                    value={newPayment.cardNumber}
                                    onChange={(e) => {
                                      const formatted = formatCardNumber(e.target.value);
                                      setNewPayment({ ...newPayment, cardNumber: formatted });
                                    }}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-mono ${
                                      newPayment.cardNumber && !validateCardNumber(newPayment.cardNumber).isValid
                                        ? 'border-red-500'
                                        : newPayment.cardNumber && validateCardNumber(newPayment.cardNumber).isValid
                                        ? 'border-green-500'
                                        : 'border-gray-300'
                                    }`}
                                    disabled={isProcessing}
                                  />
                                  {newPayment.cardNumber && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      {validateCardNumber(newPayment.cardNumber).isValid ? (
                                        <div className="text-green-500">✓</div>
                                      ) : (
                                        <div className="text-red-500">✗</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expiry Date
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    value={newPayment.expiryDate}
                                    onChange={(e) => {
                                      const formatted = formatExpiryDate(e.target.value);
                                      setNewPayment(prev => ({ ...prev, expiryDate: formatted }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CVV
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="123"
                                    maxLength={3}
                                    value={newPayment.cvv}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '');
                                      setNewPayment(prev => ({ ...prev, cvv: value }));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-black font-mono"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Bank Account Details */}
                          {newPayment.type === 'bank' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Bank Name
                                </label>
                                <input
                                  type="text"
                                  value={newPayment.bankName}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, bankName: e.target.value }))}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                  disabled={isProcessing}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Account Number
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={newPayment.accountNumber}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '');
                                      setNewPayment(prev => ({ ...prev, accountNumber: value }));
                                    }}
                                    maxLength={17}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono ${
                                      newPayment.accountNumber && !validateBankAccount(newPayment.accountNumber)
                                        ? 'border-red-500'
                                        : newPayment.accountNumber && validateBankAccount(newPayment.accountNumber)
                                        ? 'border-green-500'
                                        : 'border-gray-300'
                                    }`}
                                    disabled={isProcessing}
                                  />
                                  {newPayment.accountNumber && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      {validateBankAccount(newPayment.accountNumber) ? (
                                        <div className="text-green-500">✓</div>
                                      ) : (
                                        <div className="text-red-500">✗</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Routing Number
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={newPayment.routingNumber}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '');
                                      setNewPayment(prev => ({ ...prev, routingNumber: value }));
                                    }}
                                    maxLength={9}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono ${
                                      newPayment.routingNumber && !validateRoutingNumber(newPayment.routingNumber)
                                        ? 'border-red-500'
                                        : newPayment.routingNumber && validateRoutingNumber(newPayment.routingNumber)
                                        ? 'border-green-500'
                                        : 'border-gray-300'
                                    }`}
                                    disabled={isProcessing}
                                  />
                                  {newPayment.routingNumber && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      {validateRoutingNumber(newPayment.routingNumber) ? (
                                        <div className="text-green-500">✓</div>
                                      ) : (
                                        <div className="text-red-500">✗</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* PayPal Details */}
                          {newPayment.type === 'paypal' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                PayPal Email
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  value={newPayment.email}
                                  onChange={(e) => setNewPayment(prev => ({ ...prev, email: e.target.value }))}
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                                    newPayment.email && !validatePayPalEmail(newPayment.email)
                                      ? 'border-red-500'
                                      : newPayment.email && validatePayPalEmail(newPayment.email)
                                      ? 'border-green-500'
                                      : 'border-gray-300'
                                  }`}
                                  disabled={isProcessing}
                                />
                                {newPayment.email && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {validatePayPalEmail(newPayment.email) ? (
                                      <div className="text-green-500">✓</div>
                                    ) : (
                                      <div className="text-red-500">✗</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-4">
                            <button
                              type="button"
                              onClick={() => setShowAddPayment(false)}
                              className="px-4 py-2 text-gray-600 hover:text-gray-900"
                              disabled={isProcessing}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isProcessing}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 relative"
                            >
                              {isProcessing ? (
                                <>
                                  <span className="opacity-0">Add Payment Method</span>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  </div>
                                </>
                              ) : (
                                'Add Payment Method'
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h2>
                  <div className="space-y-6">
                    {connectedAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          {getProviderIcon(account.provider)}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {account.provider.charAt(0).toUpperCase() + account.provider.slice(1)}
                            </h3>
                            <p className="text-sm text-gray-500">{account.email}</p>
                          </div>
                        </div>
                        <button
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            account.connected
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-primary hover:bg-primary/5'
                          }`}
                          onClick={() => handleIntegrationToggle(account.provider, !account.connected)}
                        >
                          {account.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {confirmationDialog.type === 'remove' ? 'Remove Payment Method' : 'Set Default Payment Method'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmationDialog.type === 'remove' 
                ? `Are you sure you want to remove this ${confirmationDialog.paymentType} ending in ${confirmationDialog.lastFour}?`
                : `Set ${confirmationDialog.paymentType} ending in ${confirmationDialog.lastFour} as your default payment method?`
              }
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmationDialog(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmationDialog.type === 'remove'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary hover:bg-primary/90'
                } disabled:opacity-50 relative`}
              >
                {isProcessing ? (
                  <>
                    <span className="opacity-0">
                      {confirmationDialog.type === 'remove' ? 'Remove' : 'Set Default'}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  confirmationDialog.type === 'remove' ? 'Remove' : 'Set Default'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}