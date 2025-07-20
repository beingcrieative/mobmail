'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, TrendingUp, Calendar, Settings, User, BarChart3, PlayCircle, PhoneForwarded, PhoneOff, PhoneMissed, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Header from '@/components/mobile-v3/Header';
import BottomNavigation from '@/components/mobile-v3/BottomNavigation';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthDebugInfo from '@/components/mobile-v3/AuthDebugInfo';
import AuthStatus from '@/components/mobile-v3/AuthStatus';

interface DashboardStats {
  todayVoicemails: number;
  timeSaved: number;
  weeklyTrend: number;
  totalTranscriptions: number;
  unreadCount: number;
  avgDuration: number;
}

interface RecentActivity {
  id: string;
  type: 'voicemail' | 'call' | 'transcription' | 'insight';
  title: string;
  subtitle: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

interface Transcription {
  id: string;
  customerName: string;
  externalNumber: string;
  startTime: number;
  callDuration: number;
  transcriptSummary: string;
  transcript: Array<{
    role: string;
    message: string;
    timeInCallSecs?: number;
  }>;
  client_id?: string;
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

// Get status color for visual indicators
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return '#10b981'; // Green
    case 'inactive': return '#ef4444'; // Red
    case 'unknown': return '#6b7280'; // Gray
    default: return '#d1d5db'; // Light gray
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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [forwardingStatus, setForwardingStatus] = useState<{[key: string]: {status: string, lastChecked: string}}>({});
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatusCheck, setPendingStatusCheck] = useState<{type: string, statusCode: string} | null>(null);
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
      console.log('Fetching transcriptions for user:', userId);
      const response = await fetch(`/api/transcriptions?clientId=${userId}&t=${new Date().getTime()}`);
      
      if (!response.ok) {
        console.error('API response not ok:', response.status, response.statusText);
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const data = await response.json();
      const transcriptions: Transcription[] = data.transcriptions || [];
      
      console.log('Fetched transcriptions:', transcriptions.length);
      
      // Calculate real stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayTimestamp = Math.floor(todayStart.getTime() / 1000);
      
      const todayTranscriptions = transcriptions.filter(t => t.startTime >= todayTimestamp);
      const totalDuration = transcriptions.reduce((sum, t) => sum + (t.callDuration || 0), 0);
      const avgDuration = transcriptions.length > 0 ? Math.round(totalDuration / transcriptions.length) : 0;
      
      // Calculate time saved (assuming 2 minutes saved per transcription)
      const timeSavedMinutes = transcriptions.length * 2;
      
      setStats({
        todayVoicemails: todayTranscriptions.length,
        timeSaved: timeSavedMinutes,
        weeklyTrend: 12, // Mock trend for now
        totalTranscriptions: transcriptions.length,
        unreadCount: transcriptions.length, // All are considered unread for now
        avgDuration
      });
      
      // Generate recent activity from real data
      const recentActivities: RecentActivity[] = transcriptions
        .slice(0, 3)
        .map((t, index) => {
          const timeAgo = formatTimeAgo(t.startTime);
          return {
            id: t.id,
            type: 'transcription' as const,
            title: 'Voicemail transcriptie',
            subtitle: `${t.customerName || 'Onbekende beller'} - ${t.transcriptSummary?.substring(0, 50) || 'Transcriptie beschikbaar'}...`,
            time: timeAgo,
            priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
          };
        });
      
      setRecentActivity(recentActivities);
      
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
      setRecentActivity([]);
    } finally {
      setDataLoading(false);
    }
  };

    const formatTimeAgo = (timestamp: number) => {
      const now = Math.floor(Date.now() / 1000);
      const diffInSeconds = now - timestamp;
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes} min geleden`;
      } else if (diffInHours < 24) {
        return `${diffInHours} uur geleden`;
      } else {
        return `${diffInDays} dag${diffInDays === 1 ? '' : 'en'} geleden`;
      }
    };

  // Load forwarding status from localStorage with expiration check
  useEffect(() => {
    const savedStatus = localStorage.getItem('voicemail_forwarding_status');
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
  }, []);

  // Update forwarding status
  const updateForwardingStatus = (type: string, status: string) => {
    const newStatus = {
      ...forwardingStatus,
      [type]: {
        status,
        lastChecked: new Date().toISOString()
      }
    };
    
    setForwardingStatus(newStatus);
    localStorage.setItem('voicemail_forwarding_status', JSON.stringify(newStatus));
    
    toast.success(`Doorschakeling status bijgewerkt: ${getStatusLabel(status)}`);
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
      updateForwardingStatus(pendingStatusCheck.type, isActive ? 'active' : 'inactive');
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'voicemail': return Phone;
      case 'transcription': return PlayCircle;
      case 'insight': return TrendingUp;
      default: return Clock;
    }
  };

  const getActivityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

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
    <div className="h-full" style={{ background: 'transparent' }}>
      <Header 
        title="VoicemailAI" 
        showNotifications={stats.unreadCount > 0}
        showSettings={false}
      />

      <div className="px-4 py-6 pb-24">
        <AuthStatus />
        
        {/* Welcome Section - Clean Professional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="accent-hero mb-6"
          style={{
            margin: '0 -20px 24px -20px'
          }}
        >
          <h2
            style={{
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-white)',
              marginBottom: 'var(--spacing-sm)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            {getGreeting()}, {getDisplayName()}!
          </h2>
          <p 
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: 'var(--font-size-body)',
              fontFamily: 'var(--font-family-primary)'
            }}
          >
            {dataLoading ? 'Gegevens laden...' : getPersonalizedMessage()}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div 
            className="blabla-card hover-lift"
            style={{
              minHeight: '120px'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <Clock 
                size={20} 
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <span 
                style={{
                  fontSize: 'var(--font-size-tiny)',
                  color: 'var(--color-success)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                +{stats.weeklyTrend}%
              </span>
            </div>
            <p 
              style={{
                fontSize: '36px',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              {stats.timeSaved}min
            </p>
            <p 
              style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              Tijd bespaard
            </p>
          </div>
          
          <div 
            className="blabla-card hover-lift"
            style={{
              minHeight: '120px'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp 
                size={20} 
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <span 
                style={{
                  fontSize: 'var(--font-size-tiny)',
                  color: 'var(--color-secondary)',
                  fontWeight: 'var(--font-weight-medium)'
                }}
              >
                {stats.totalTranscriptions}
              </span>
            </div>
            <p 
              style={{
                fontSize: '36px',
                fontWeight: 'var(--font-weight-bold)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              {stats.todayVoicemails}
            </p>
            <p 
              style={{
                fontSize: 'var(--font-size-small)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-primary)'
              }}
            >
              Vandaag
            </p>
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
          
          {/* Bulk Status Check Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={checkAllForwardingStatus}
            className="mb-4 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <BarChart3 size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Alle statussen controleren</span>
          </motion.button>
          
          <div className="grid grid-cols-4 gap-4">
            {doorschakelActies.map((action, index) => {
              const Icon = action.icon;
              const currentStatus = forwardingStatus[action.type]?.status || 'unknown';
              const isLoading = loadingStates[action.type] || false;
              
              const handleActivate = async () => {
                setActionLoading(action.type, true);
                await openDialer(action.ussdCode);
                
                // After 3 seconds, offer status check
                setTimeout(() => {
                  const shouldCheck = window.confirm(
                    'Doorschakeling uitgevoerd!\n\nWil je de status controleren?'
                  );
                  
                  if (shouldCheck) {
                    checkForwardingStatus(action.type, action.statusCode);
                  }
                  setActionLoading(action.type, false);
                }, 3000);
              };
              
              const handleLongPress = () => {
                checkForwardingStatus(action.type, action.statusCode);
              };
              
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={handleActivate}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleLongPress();
                  }}
                  disabled={isLoading}
                  className="relative blabla-card-compact hover-lift flex flex-col items-center"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                    touchAction: 'manipulation',
                    padding: 'var(--spacing-sm)',
                    height: '88px',
                    minWidth: '70px'
                  }}
                >
                  {/* Status indicator */}
                  <div 
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: getStatusColor(currentStatus) }}
                  />
                  
                  {/* Icon container */}
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                    {isLoading ? (
                      <Loader2 size={18} className="text-white animate-spin" />
                    ) : (
                      <Icon size={18} className="text-white" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span 
                    className="text-center"
                    style={{
                      fontSize: 'var(--font-size-tiny)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-family-primary)',
                      lineHeight: '1.2'
                    }}
                  >
                    {action.label}
                  </span>
                  
                  {/* Status badge with age */}
                  <div 
                    className="mt-1 text-center"
                    style={{
                      fontSize: '10px',
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-family-primary)',
                      lineHeight: '1'
                    }}
                  >
                    <div>{getStatusLabel(currentStatus)}</div>
                    {forwardingStatus[action.type]?.lastChecked && (
                      <div style={{ fontSize: '9px', marginTop: '2px' }}>
                        {getStatusAge(forwardingStatus[action.type].lastChecked)}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
            Recente activiteit
          </h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileTap={{ scale: 0.98 }}
                  className="blabla-card-compact flex items-center space-x-3 cursor-pointer hover-lift"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                  onClick={() => router.push('/mobile-v3/transcriptions')}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.priority)}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>

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
    </div>
  );
}