'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, TrendingUp, Calendar, Settings, User, BarChart3, PlayCircle, PhoneForwarded, PhoneOff, PhoneMissed, X, Loader2, Bell, BellRing, Trash2, Check, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthDebugInfo from '@/components/mobile-v3/AuthDebugInfo';
import AuthStatus from '@/components/mobile-v3/AuthStatus';
import { StatisticsService, DashboardStats, RecentActivity } from '@/lib/services/statisticsService';

interface Notification {
  id: string;
  type: 'new_voicemail' | 'transcription_ready' | 'system_update' | 'forwarding_status' | 'missed_call';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  metadata?: any;
}


// Get forwarding number from environment
const getForwardingNumber = () => {
  return process.env.NEXT_PUBLIC_FORWARDING_NUMBER || '0900123456';
};

// Validate USSD code for security
const validateUSSDCode = (code: string): boolean => {
  const safePatterns = [
    /^\*21\*\d{10,15}#$/, // Unconditional forwarding
    /^\*61\*\d{10,15}#$/, // No answer forwarding
    /^\*62\*\d{10,15}#$/, // Unreachable forwarding
    /^\*67\*\d{10,15}#$/, // Busy forwarding
    /^\*#21#$/, /^\*#61#$/, /^\*#62#$/, /^\*#67#$/, // Status checks
    /^##21#$/, /^##61#$/, /^##62#$/, /^##67#$/ // Deactivation
  ];
  
  return safePatterns.some(pattern => pattern.test(code));
};

// Get status color for visual indicators - VoicemailAI success psychology
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return '#76c893'; // VoicemailAI Emerald - business success
    case 'inactive': return '#ef4444'; // Red (kept for error)
    case 'unknown': return '#52b69a'; // VoicemailAI Keppel - balanced state
    default: return '#34a0a4'; // VoicemailAI Verdigris - information
  }
};

// Get status label
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active': return 'Actief';
    case 'inactive': return 'Uit';
    case 'unknown': return 'Onbekend';
    default: return 'Controleren';
  }
};

export default function MobileHomePage() {
  const { isAuthenticated, user, loading: authLoading, error: authError } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    todayVoicemails: 0,
    timeSaved: 0,
    weeklyTrend: 0,
    totalTranscriptions: 0,
    unreadCount: 0,
    avgDuration: 0
  });
  // Recent activity removed for now - structure preserved for future additions
  const [dataLoading, setDataLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [forwardingStatus, setForwardingStatus] = useState<{[key: string]: {status: string, lastChecked: string}}>({});
  const [activeForwardingType, setActiveForwardingType] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusCheck, setPendingStatusCheck] = useState<{type: string, statusCode: string} | null>(null);
  const [selectedForwardingMode, setSelectedForwardingMode] = useState<string | null>(null);
  const [nextEvent, setNextEvent] = useState<any>(null);
  const router = useRouter();

  // Fetch user data when authentication state changes
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.id) {
      console.log('User authenticated, fetching data for:', user.email);
      fetchRealData(user.id);
    } else if (!authLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchRealData = async (userId: string) => {
    setDataLoading(true);
    try {
      const { dashboardStats } = await StatisticsService.getUserStatistics(userId);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching real data:', error);
      // Show more specific error information
      if (authError) {
        console.error('Authentication error:', authError);
      }
      // Fallback to empty data with error indication
      setStats({
        todayVoicemails: 0,
        timeSaved: 0,
        weeklyTrend: 0,
        totalTranscriptions: 0,
        unreadCount: 0,
        avgDuration: 0
      });
    } finally {
      setDataLoading(false);
    }
  };


  // Load forwarding status from localStorage with expiration check
  useEffect(() => {
    const savedStatus = localStorage.getItem('voicemail_forwarding_status');
    const savedActiveType = localStorage.getItem('voicemail_active_forwarding_type');
    
    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus);
        const cleanedStatus: any = {};
        
        // Remove expired status entries (older than 24 hours)
        Object.keys(parsedStatus).forEach(key => {
          const statusData = parsedStatus[key];
          const lastChecked = new Date(statusData.lastChecked);
          const hoursSinceCheck = (Date.now() - lastChecked.getTime()) / (1000 * 60 * 60);
          
          if (hoursSinceCheck < 24) {
            cleanedStatus[key] = statusData;
          }
        });
        
        setForwardingStatus(cleanedStatus);
        
        // Save cleaned status back to localStorage
        localStorage.setItem('voicemail_forwarding_status', JSON.stringify(cleanedStatus));
      } catch (error) {
        console.error('Error parsing forwarding status:', error);
      }
    }
    
    // Load active forwarding type
    if (savedActiveType) {
      setActiveForwardingType(savedActiveType);
    }
  }, []);

  // Check for new user onboarding
  useEffect(() => {
    const checkUserOnboarding = async () => {
      if (!authLoading && isAuthenticated && user?.id) {
        try {
          // Check if wizard needs to be shown for incomplete profiles
          const response = await fetch('/api/user/profile');
          const profileData = await response.json();
          
          const wizardShown = localStorage.getItem('wizardComplete');
          
          if (!wizardShown && (!profileData.name || !profileData.mobileNumber)) {
            // Show wizard after slight delay
            setTimeout(() => {
              router.push('/mobile-v3/profile?wizard=true&source=onboarding');
            }, 1500);
          }
        } catch (error) {
          console.log('Skipping automatic wizard for now', error);
        }
      }
    };

    checkUserOnboarding();
  }, [authLoading, isAuthenticated, user?.id, router]);

  // Update forwarding status with mutual exclusivity
  const updateForwardingStatus = (type: string, status: string, isActivation: boolean = false) => {
    const newStatus = {
      ...forwardingStatus,
      [type]: {
        status,
        lastChecked: new Date().toISOString()
      }
    };
    
    setForwardingStatus(newStatus);
    localStorage.setItem('voicemail_forwarding_status', JSON.stringify(newStatus));
    
    // Handle mutual exclusivity for forwarding types
    if (isActivation && status === 'active' && type !== 'disable') {
      // Set this as the active forwarding type
      setActiveForwardingType(type);
      localStorage.setItem('voicemail_active_forwarding_type', type);
      
      // Deactivate other forwarding types
      const otherTypes = ['unconditional', 'busy', 'unanswered'].filter(t => t !== type);
      otherTypes.forEach(otherType => {
        if (forwardingStatus[otherType]?.status === 'active') {
          const deactivatedStatus = {
            ...newStatus,
            [otherType]: {
              status: 'inactive',
              lastChecked: new Date().toISOString()
            }
          };
          setForwardingStatus(deactivatedStatus);
          localStorage.setItem('voicemail_forwarding_status', JSON.stringify(deactivatedStatus));
        }
      });
      
      toast.success(`${getDoorschakelLabel(type)} geactiveerd - andere types gedeactiveerd`);
    } else if (type === 'disable' && status === 'active') {
      // Disable all forwarding
      setActiveForwardingType(null);
      localStorage.removeItem('voicemail_active_forwarding_type');
      toast.success('Alle doorschakelingen uitgeschakeld');
    } else {
      toast.success(`Doorschakeling status bijgewerkt: ${getStatusLabel(status)}`);
    }
  };
  
  // Helper function to get doorschakeling label
  const getDoorschakelLabel = (type: string): string => {
    switch (type) {
      case 'unconditional': return 'Altijd doorschakelen';
      case 'busy': return 'Bezet doorschakelen';
      case 'unanswered': return 'Niet opgenomen doorschakelen';
      case 'disable': return 'Uitschakelen';
      default: return 'Doorschakeling';
    }
  };

  // Get enhanced button styling based on active state
  const getButtonStyling = (actionType: string, currentStatus: string) => {
    const isActive = activeForwardingType === actionType && currentStatus === 'active';
    const isDisabled = actionType === 'disable';
    
    if (isActive && !isDisabled) {
      return {
        buttonClass: 'relative blabla-card-compact hover-lift flex flex-col items-center border-2 border-green-400 bg-green-50',
        iconColorClass: 'bg-green-500',
        textColor: 'var(--color-text-primary)'
      };
    }
    
    return {
      buttonClass: 'relative blabla-card-compact hover-lift flex flex-col items-center',
      iconColorClass: actionType === 'unconditional' ? 'bg-blue-500' :
                      actionType === 'busy' ? 'bg-orange-500' :
                      actionType === 'unanswered' ? 'bg-purple-500' : 'bg-gray-500',
      textColor: 'var(--color-text-primary)'
    };
  };

  // Set loading state for a specific action
  const setActionLoading = (actionType: string, isLoading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [actionType]: isLoading }));
  };

  // Open dialer with proper encoding
  const openDialer = (ussdCode: string) => {
    const forwardingNumber = getForwardingNumber();
    const fullCode = ussdCode.replace('{FORWARDING_NUMBER}', forwardingNumber);
    
    if (!validateUSSDCode(fullCode)) {
      toast.error('Ongeldige USSD code');
      return;
    }
    
    const encodedCode = encodeURIComponent(fullCode);
    const telLink = `tel:${encodedCode}`;
    
    try {
      window.location.href = telLink;
      toast.info('📞 Dialer wordt geopend...');
    } catch (error) {
      console.error('Error opening dialer:', error);
      toast.error('Kon dialer niet openen');
    }
  };

  // Check forwarding status with improved UI
  const checkForwardingStatus = (type: string, statusCode: string) => {
    const encodedStatusCode = encodeURIComponent(statusCode);
    
    try {
      window.location.href = `tel:${encodedStatusCode}`;
      
      // Store pending check and show modal after delay
      setTimeout(() => {
        setPendingStatusCheck({ type, statusCode });
        setShowStatusModal(true);
      }, 2000);
    } catch (error) {
      console.error('Error checking status:', error);
      toast.error('Kon status niet controleren');
    }
  };

  // Bulk status check for all forwarding types
  const checkAllForwardingStatus = () => {
    const statusCheckCodes = ['*#21#', '*#67#', '*#61#'];
    let currentCheckIndex = 0;
    
    const checkNext = () => {
      if (currentCheckIndex < statusCheckCodes.length) {
        const code = statusCheckCodes[currentCheckIndex];
        const encodedCode = encodeURIComponent(code);
        
        try {
          window.location.href = `tel:${encodedCode}`;
          currentCheckIndex++;
          
          if (currentCheckIndex < statusCheckCodes.length) {
            setTimeout(() => {
              const shouldContinue = window.confirm(
                `Status controle ${currentCheckIndex}/3 voltooid.\n\nWil je doorgaan met de volgende controle?`
              );
              if (shouldContinue) {
                checkNext();
              }
            }, 3000);
          } else {
            toast.success('Alle status controles voltooid!');
          }
        } catch (error) {
          console.error('Error in bulk status check:', error);
          toast.error('Fout bij status controle');
        }
      }
    };
    
    toast.info('Start bulk status controle...');
    checkNext();
  };

  // Handle status confirmation from modal
  const handleStatusConfirmation = (isActive: boolean) => {
    if (pendingStatusCheck) {
      updateForwardingStatus(pendingStatusCheck.type, isActive ? 'active' : 'inactive', isActive);
      setShowStatusModal(false);
      setPendingStatusCheck(null);
    }
  };

  // Get status age in human readable format
  const getStatusAge = (lastChecked: string) => {
    const now = new Date();
    const checked = new Date(lastChecked);
    const hoursDiff = Math.floor((now.getTime() - checked.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff < 1) return 'Net gecontroleerd';
    if (hoursDiff === 1) return '1 uur geleden';
    if (hoursDiff < 24) return `${hoursDiff} uur geleden`;
    return 'Meer dan 24 uur geleden';
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle Stripe return callback - only run on client side
  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('source');
      if (source === 'stripe') {
        // Clear the parameter and refresh data
        const url = new URL(window.location.href);
        url.searchParams.delete('source');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []); // No dependencies needed since we check window.location directly

  const handleLaunchWizard = () => {
    router.push('/mobile-v3/profile?wizard=true');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const day = currentTime.getDay();
    const isWeekend = day === 0 || day === 6;
    const isMonday = day === 1;
    const isFriday = day === 5;
    
    // Base greeting by time
    let baseGreeting = '';
    if (hour < 12) baseGreeting = 'Goedemorgen';
    else if (hour < 18) baseGreeting = 'Goedemiddag';
    else baseGreeting = 'Goedenavond';
    
    // Add contextual elements
    if (isWeekend) return `${baseGreeting} en fijn weekend`;
    if (isMonday) return `${baseGreeting} en een goede start van de week`;
    if (isFriday) return `${baseGreeting} en alvast een fijn weekend`;
    
    return baseGreeting;
  };

  const getPersonalizedMessage = () => {
    const { todayVoicemails, totalTranscriptions, timeSaved } = stats;
    const hour = currentTime.getHours();
    const isEarlyMorning = hour < 9;
    const isLateEvening = hour > 20;
    
    // Achievement-based messages
    if (todayVoicemails >= 10) {
      return "Wat een productieve dag! Je hebt al veel voicemails verwerkt.";
    }
    if (totalTranscriptions >= 100) {
      return "Geweldig! Je hebt al meer dan 100 transcripties verzameld.";
    }
    if (timeSaved >= 60) {
      return `Je hebt al ${timeSaved} minuten bespaard met VoicemailAI!`;
    }
    
    // Time-based messages
    if (isEarlyMorning) {
      return "Je bent er vroeg bij vandaag! Klaar voor een productieve dag?";
    }
    if (isLateEvening) {
      return "Nog even laat aan het werk? Je voicemails zijn veilig bij ons.";
    }
    
    // Default messages based on activity
    if (todayVoicemails === 0) {
      return "Een rustige dag tot nu toe. Alle voicemails staan klaar voor je.";
    }
    
    return `Je hebt ${todayVoicemails} voicemails vandaag verwerkt`;
  };

  const getFirstName = (email: string) => {
    if (!email) return 'Gebruiker';
    // Try to get name from email, capitalize first letter
    const nameFromEmail = email.split('@')[0].split('.')[0];
    return nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
  };

  // Enhanced name resolution - try to get real name from profile
  const [profileName, setProfileName] = useState<string>('');

  // Real-time notification polling
  useEffect(() => {
    let notificationInterval: NodeJS.Timeout;

    const fetchNotifications = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/notifications?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const newNotifications = data.notifications || [];
          
          // Check for new unread notifications
          const hasUnread = newNotifications.some((n: Notification) => !n.read);
          setHasNewNotifications(hasUnread);
          
          setNotifications(newNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const startNotificationPolling = () => {
      fetchNotifications(); // Initial fetch
      notificationInterval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    };

    if (user?.id) {
      startNotificationPolling();
    }

    return () => {
      if (notificationInterval) {
        clearInterval(notificationInterval);
      }
    };
  }, [user?.id]);

  // Fetch next agenda event for the user
  useEffect(() => {
    const fetchNextAgendaEvent = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/agenda-events?userId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const events = Array.isArray(data.events) ? data.events : [];
        const now = new Date();
        const upcoming = events
          .map((e: any) => ({
            ...e,
            start: new Date(e.start_time || e.startTime || e.start),
            end: new Date(e.end_time || e.endTime || e.end),
          }))
          .filter((e: any) => e.start.getTime() >= now.getTime())
          .sort((a: any, b: any) => a.start.getTime() - b.start.getTime())[0];
        setNextEvent(upcoming || null);
      } catch (e) {
        // silent fail; card stays hidden
      }
    };
    fetchNextAgendaEvent();
  }, [user?.id]);

  // Generate mock notifications for demonstration
  useEffect(() => {
    if (user?.id && notifications.length === 0) {
      const mockNotifications: Notification[] = [
        {
          id: 'notif-1',
          type: 'new_voicemail',
          title: 'Nieuwe voicemail',
          message: 'Je hebt een nieuwe voicemail ontvangen van +31 6 12345678',
          timestamp: Date.now() - 300000, // 5 minutes ago
          read: false,
          priority: 'high',
          actionUrl: '/mobile-v3/transcriptions'
        },
        {
          id: 'notif-2',
          type: 'transcription_ready',
          title: 'Transcriptie klaar',
          message: 'De transcriptie van je gesprek met John Doe is beschikbaar',
          timestamp: Date.now() - 900000, // 15 minutes ago
          read: false,
          priority: 'medium',
          actionUrl: '/mobile-v3/transcriptions'
        },
        {
          id: 'notif-3',
          type: 'forwarding_status',
          title: 'Doorschakeling status',
          message: 'Je doorschakeling naar voicemail is succesvol geactiveerd',
          timestamp: Date.now() - 3600000, // 1 hour ago
          read: true,
          priority: 'low'
        }
      ];
      
      setNotifications(mockNotifications);
      setHasNewNotifications(mockNotifications.some(n => !n.read));
    }
  }, [user?.id, notifications.length]);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      // Update has new notifications flag
      const stillHasUnread = notifications.some(n => n.id !== notificationId && !n.read);
      setHasNewNotifications(stillHasUnread);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setHasNewNotifications(false);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_voicemail': return Phone;
      case 'transcription_ready': return PlayCircle;
      case 'missed_call': return PhoneMissed;
      case 'forwarding_status': return PhoneForwarded;
      case 'system_update': return Settings;
      default: return Bell;
    }
  };

  // Get notification color
  const getNotificationColor = (priority: string, read: boolean) => {
    if (read) return 'bg-gray-100 text-gray-600';
    
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    
    setShowNotifications(false);
  };

  // Format notification time
  const formatNotificationTime = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}u`;
    } else {
      return `${diffInDays}d`;
    }
  };
  
  useEffect(() => {
    const fetchProfileName = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const profileData = await response.json();
            if (profileData.name && profileData.name.trim()) {
              setProfileName(profileData.name.split(' ')[0]); // First name only
            }
          }
        } catch (error) {
          console.log('Could not fetch profile name, using email fallback');
        }
      }
    };
    
    fetchProfileName();
  }, [user?.id]);
  
  const getDisplayName = () => {
    if (profileName) return profileName;
    return getFirstName(user?.email || '');
  };

  const doorschakelActies = [
    {
      icon: PhoneForwarded,
      label: 'Altijd doorschakelen',
      color: 'bg-blue-500',
      ussdCode: '*21*{FORWARDING_NUMBER}#',
      statusCode: '*#21#',
      deactivateCode: '##21#',
      type: 'unconditional'
    },
    {
      icon: PhoneOff,
      label: 'Bezet doorschakelen',
      color: 'bg-orange-500',
      ussdCode: '*67*{FORWARDING_NUMBER}#',
      statusCode: '*#67#',
      deactivateCode: '##67#',
      type: 'busy'
    },
    {
      icon: PhoneMissed,
      label: 'Niet opgenomen',
      color: 'bg-purple-500',
      ussdCode: '*61*{FORWARDING_NUMBER}#',
      statusCode: '*#61#',
      deactivateCode: '##61#',
      type: 'unanswered'
    },
    {
      icon: X,
      label: 'Uitschakelen',
      color: 'bg-gray-500',
      ussdCode: '##21#',
      statusCode: '*#21#',
      deactivateCode: '##21#',
      type: 'disable'
    }
  ];

  // Activity helper functions removed - can be re-added when implementing future recent activity feature

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticatie controleren...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (!isAuthenticated) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Niet ingelogd</h2>
          <p className="text-gray-600 mb-6">Je bent niet ingelogd. Doorverwijzen naar loginpagina...</p>
          {authError && (
            <p className="text-red-600 text-sm">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full" style={{ background: 'var(--va-bg-home)' }}>
      <Header 
        title="VoicemailAI" 
        subtitle={`${getGreeting()}, ${getDisplayName()}!`}
        showNotifications={hasNewNotifications}
        showSettings={false}
        onNotificationClick={() => setShowNotifications(true)}
      />

      <div className="px-4 py-6 pb-24">
        <AuthStatus />
        
        {/* Welcome Section condensed into header; keep a concise status line here */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="va-section-card p-3">
            <p 
              className="text-sm"
            style={{
                color: 'var(--color-text-secondary)'
            }}
          >
              {dataLoading ? 'Gegevens laden...' : `${stats.todayVoicemails} nieuwe berichten - zakelijk actief!`}
          </p>
          </div>
        </motion.div>

        {/* Business Stats Section - VoicemailAI Success Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="p-4 rounded-xl va-section-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>
                📈
              </div>
              <div>
                <div
                  className="font-medium text-sm"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Vandaag: €{stats.todayVoicemails * 150} leads
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {stats.todayVoicemails} gesprekken → {Math.max(1, Math.floor(stats.todayVoicemails * 0.7))} potentiële klanten
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 
            style={{
              fontSize: 'var(--font-size-h3)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-md)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            Snelle acties
          </h3>
          
          {/* Enhanced Bulk Status Check Button - VoicemailAI Professional */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={checkAllForwardingStatus}
            className="mb-4 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-colors"
            style={{
              background: 'var(--background-subtle)',
              border: '1px solid var(--card-border)',
              color: 'var(--color-text-primary)'
            }}
            aria-label="Controleer de status van alle doorschakelingen"
            title="Controleert systematisch de status van alle doorschakeling types"
          >
            <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Alle statussen controleren</span>
          </motion.button>
          {/* Forwarding segmented control - cooler UX */}
          <div className="va-section-card p-3 mb-3">
            <div className="relative w-full bg-white border border-[color:var(--card-border)] rounded-xl p-1">
              <div className="grid grid-cols-4 gap-1 relative">
                {doorschakelActies.map((action, idx) => {
              const Icon = action.icon;
                  const isActive = (activeForwardingType === action.type && (forwardingStatus[action.type]?.status || 'unknown') === 'active');
                  const isSelected = selectedForwardingMode === action.type || isActive;
                  const handleSelect = async () => {
                    setSelectedForwardingMode(action.type);
                setActionLoading(action.type, true);
                toast.info(`${getDoorschakelLabel(action.type)} wordt geactiveerd...`);
                await openDialer(action.ussdCode);
                setTimeout(() => {
                  const shouldCheck = window.confirm(
                        `✅ ${getDoorschakelLabel(action.type)} commando verzonden!\n\nStatus controleren om te bevestigen?`
                  );
                  if (shouldCheck) {
                    checkForwardingStatus(action.type, action.statusCode);
                  } else {
                    updateForwardingStatus(action.type, 'active', true);
                  }
                  setActionLoading(action.type, false);
                    }, 2000);
                  };
              return (
                <motion.button
                      key={action.type}
                  whileTap={{ scale: 0.98 }}
                      onClick={handleSelect}
                      onContextMenu={(e) => { e.preventDefault(); checkForwardingStatus(action.type, action.statusCode); }}
                      className="relative flex flex-col items-center justify-center py-2 rounded-lg h-16"
                  style={{ 
                        background: isSelected ? 'rgba(37,99,232,0.08)' : 'transparent',
                        border: isSelected ? '1px solid rgba(37,99,232,0.15)' : '1px solid transparent'
                      }}
                      title={`${getDoorschakelLabel(action.type)}${isActive ? ' (actief)' : ''}`}
                    >
                      <Icon size={16} style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                      <span className="mt-1 text-[10px] font-medium leading-none" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                        {action.type === 'unconditional' ? 'Altijd' :
                         action.type === 'busy' ? 'Bezet' :
                         action.type === 'unanswered' ? 'Niet opn.' : 'Uit'}
                  </span>
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: '#059669' }} />
                      )}
                    </motion.button>
                  );
                })}
                    </div>
                      </div>
            {/* Status chips */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {doorschakelActies.map((action) => {
                const currentStatus = forwardingStatus[action.type]?.status || 'unknown';
                const isActive = activeForwardingType === action.type && currentStatus === 'active';
                const color = isActive ? '#059669' : getStatusColor(currentStatus);
                const shortLabel = action.type === 'unconditional' ? 'Altijd' : action.type === 'busy' ? 'Bezet' : action.type === 'unanswered' ? 'Niet opn.' : 'Uit';
                const shortStatus = isActive ? 'Actief' : getStatusLabel(currentStatus);
                return (
                  <div key={`chip-${action.type}`} className="flex items-center justify-between px-2 py-1 rounded-lg text-[10px] border bg-white"
                       style={{ borderColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{shortLabel}</span>
                    <span className="font-medium" style={{ color }}>{shortStatus}</span>
                  </div>
              );
            })}
            </div>
          </div>
        </motion.div>

        {/* Navigation Actions - VoicemailAI Business Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile-v3/transcriptions')}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                border: '2px solid var(--va-verdigris)',
                background: 'white'
              }}
            >
              <div
                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm"
                style={{ background: 'var(--va-verdigris)' }}
              >
                💬
              </div>
              <div className="text-left">
                <div
                  className="font-medium text-sm"
                  style={{ color: 'var(--va-indigo-dye)' }}
                >
                  Bekijk Gesprekken
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--va-lapis-lazuli)' }}
                >
                  {stats.todayVoicemails} nieuwe transcripties
                </div>
              </div>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/mobile-v3/agent')}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                border: '2px solid var(--va-emerald)',
                background: 'white'
              }}
            >
              <div
                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm"
                style={{ background: 'var(--va-emerald)' }}
              >
                🤖
              </div>
              <div className="text-left">
                <div
                  className="font-medium text-sm"
                  style={{ color: 'var(--va-indigo-dye)' }}
                >
                  AI Business Assistant
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--va-lapis-lazuli)' }}
                >
                  Optimaliseer je ZZP business
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Upcoming appointment card (must-have for ZZP'ers) */}
        {nextEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <div className="va-section-card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: 'var(--color-primary)' }}>
                <Calendar size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Komende afspraak</div>
                <div className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                  {nextEvent.title || 'Afspraak'}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(nextEvent.start).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(nextEvent.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => router.push('/mobile-v3/calendar')}
                className="px-3 py-2 rounded-lg text-xs font-medium"
                style={{ border: '1px solid var(--card-border)' }}
              >
                Open kalender
              </motion.button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Real-time Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="blabla-card w-full max-w-md mx-4 max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <BellRing size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Meldingen</h3>
                  {hasNewNotifications && (
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.some(n => !n.read) && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Alles gelezen
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={16} className="text-gray-600" />
                  </motion.button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Geen meldingen</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                          notification.read ? 'border-gray-100 bg-gray-50' : 'border-blue-100 bg-blue-50'
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            getNotificationColor(notification.priority, notification.read)
                          }`}>
                            <Icon size={16} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className={`font-medium text-sm ${
                                notification.read ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2 ml-2">
                                <span className={`text-xs ${
                                  notification.read ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {formatNotificationTime(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                            <p className={`text-xs mt-1 ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Markeer als gelezen"
                              >
                                <Check size={12} className="text-gray-500" />
                              </motion.button>
                            )}
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 hover:bg-red-100 rounded"
                              title="Verwijderen"
                            >
                              <Trash2 size={12} className="text-gray-500 hover:text-red-500" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Status Confirmation Modal */}
      <AnimatePresence>
        {showStatusModal && pendingStatusCheck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="blabla-card w-full max-w-md"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Status Controle
                </h3>
                <p className="text-gray-600">
                  De dialer is geopend met code <strong>{pendingStatusCheck.statusCode}</strong>
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Instructies:</h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                    Druk op de groene belknop in je dialer
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                    Wacht op het automatische antwoord van je provider
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                    Luister naar de status van je doorschakeling
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Is de doorschakeling actief volgens het antwoord?
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusConfirmation(false)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                  >
                    <X size={18} />
                    <span className="font-medium">Niet Actief</span>
                  </motion.button>
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStatusConfirmation(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                  >
                    <PhoneForwarded size={18} />
                    <span className="font-medium">Actief</span>
                  </motion.button>
                </div>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowStatusModal(false);
                    setPendingStatusCheck(null);
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuleren
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation />
      <AuthDebugInfo />

      {/* Subtle Wizard Trigger */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleLaunchWizard}
        className="fixed bottom-20 right-4 p-3 rounded-full shadow-lg text-white"
        title="Setup Wizard starten"
        style={{ 
          backgroundColor: 'var(--color-primary)',
          zIndex: 40,
          transition: 'opacity 0.3s ease'
        }}
        aria-label="Setup Wizard starten"
      >
        <div className="flex items-center gap-2">
          <Settings size={20} />
          <span className="text-xs font-medium hidden">Wizard</span>
        </div>
      </motion.button>
    </div>
  );
}