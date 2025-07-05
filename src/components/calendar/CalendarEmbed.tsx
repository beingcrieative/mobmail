"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { toast } from "react-toastify";

interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  status: string;
}

interface CalendarEmbedProps {
  userId: string;
  calUsername: string; // Cal.com username
  calApiKey: string | null; // Cal.com API key
}

export default function CalendarEmbed({ userId, calUsername, calApiKey }: CalendarEmbedProps) {
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [usingMockData, setUsingMockData] = useState(false);

  // Initialize Cal.com - simplified for speed
  useEffect(() => {
    let mounted = true;
    
    // Load appointments only if API key is provided
    if (calApiKey) {
      try {
        fetchRealAppointments();
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setLoading(false);
      }
    } else {
      // No demo data, just set loading to false
      setLoading(false);
      setUsingMockData(false);
    }
    
    // Initialize Cal.com API
    const initCalApi = async () => {
      try {
        const cal = await getCalApi();
        if (!mounted) return;
        
        // Configure Cal.com UI
        cal("ui", {
          styles: { branding: { brandColor: "#3b82f6" } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
        
        // Set up event listeners for booking changes
        cal("on", {
          action: "bookingSuccessful",
          callback: () => {
            if (mounted) {
              toast.success("Booking successful! Refreshing your appointments...");
              // Refresh appointments after a successful booking
              if (calApiKey) {
                try {
                  fetchRealAppointments();
                } catch (err) {
                  console.error("Error fetching appointments after booking:", err);
                }
              }
            }
          },
        });
      } catch (err) {
        console.error("Error initializing Cal.com API:", err);
        if (mounted) {
          setError("Failed to initialize calendar. Please try again later.");
          setLoading(false);
        }
      }
    };
    
    if (calUsername) {
      initCalApi();
    } else {
      setError("No Cal.com username provided. Please set up your calendar integration.");
      setLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [calUsername, calApiKey]); // Re-initialize when username or API key changes

  // Function to fetch real appointments
  function fetchRealAppointments() {
    setLoading(true);
    setUsingMockData(false);
    
    // Only proceed if we have an API key
    if (!calApiKey) {
      console.error("No API key provided for fetching appointments");
      setLoading(false);
      return;
    }

    // Cal.com API endpoint for bookings
    // Using the correct endpoint for the Cal.com API v1
    const apiUrl = `https://api.cal.com/v1/bookings?apiKey=${calApiKey}`;
    
    fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Cal.com API response:", data);
        
        let processedAppointments: Appointment[] = [];
        
        // Check if the response has the expected structure
        if (!data.bookings || !Array.isArray(data.bookings)) {
          // Try alternative response formats
          const bookingsArray = Array.isArray(data) ? data : 
                               (data.data && Array.isArray(data.data)) ? data.data : 
                               [];
          
          if (bookingsArray.length === 0) {
            console.warn("Unexpected API response format:", data);
            setAppointments([]);
            setLoading(false);
            return;
          }
          
          // Transform the API response to our Appointment interface
          processedAppointments = bookingsArray.map((booking: any) => ({
            id: booking.uid || booking.id || String(Math.random()),
            title: booking.title || booking.eventType?.title || "Meeting",
            startTime: booking.startTime || booking.start || new Date().toISOString(),
            endTime: booking.endTime || booking.end || new Date().toISOString(),
            attendees: (booking.attendees?.map((attendee: any) => attendee.email) || 
                       [booking.attendee?.email]).filter(Boolean),
            status: booking.status || booking.state || "confirmed"
          }));
        } else {
          // Transform the API response to our Appointment interface
          processedAppointments = data.bookings.map((booking: any) => ({
            id: booking.uid || String(booking.id),
            title: booking.title || "Meeting",
            startTime: booking.startTime,
            endTime: booking.endTime,
            attendees: booking.attendees?.map((attendee: any) => attendee.email) || [],
            status: booking.status || "confirmed"
          }));
        }
        
        // Filter to only include upcoming appointments
        const now = new Date();
        const upcomingAppointments = processedAppointments.filter(appointment => {
          const appointmentDate = new Date(appointment.startTime);
          return appointmentDate >= now;
        });
        
        // Sort appointments by date (earliest first)
        const sortedAppointments = upcomingAppointments.sort((a, b) => {
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
        
        setAppointments(sortedAppointments);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching realtime appointments:", error);
        toast.error("Failed to fetch appointments. Please check your API key and try again.");
        setAppointments([]);
        setLoading(false);
      });
  }

  // Render the Cal.com embed
  const renderCalEmbed = () => {
    if (!calUsername) {
      return (
        <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Please set up your Cal.com integration first.</p>
        </div>
      );
    }

    try {
      return (
        <Cal
          calLink={calUsername}
          style={{ width: '100%', height: '100%', overflow: 'hidden' }}
          config={{
            name: userId,
            hideEventTypeDetails: "false",
            layout: 'month_view',
            theme: 'light',
          }}
        />
      );
    } catch (err) {
      console.error("Error rendering Cal.com embed:", err);
      return (
        <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-red-500">Failed to load calendar. Please try again later.</p>
        </div>
      );
    }
  };

  // Handle refresh button click
  function handleRefresh() {
    if (calApiKey) {
      try {
        fetchRealAppointments();
      } catch (err) {
        console.error("Error refreshing appointments:", err);
        toast.error("Failed to refresh appointments. Please try again.");
      }
    } else {
      toast.info("Please provide an API key to fetch your appointments.");
    }
  }

  // Format date for display
  function formatDate(dateString: string) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('nl-NL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return dateString;
    }
  }

  // Calculate relative time (e.g., "Tomorrow", "In 3 days")
  function getRelativeTime(dateString: string) {
    try {
      const appointmentDate = new Date(dateString);
      const today = new Date();
      
      // Reset time part for date comparison
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const appointmentDay = new Date(
        appointmentDate.getFullYear(), 
        appointmentDate.getMonth(), 
        appointmentDate.getDate()
      );
      
      // Calculate difference in days
      const diffTime = appointmentDay.getTime() - todayDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
      
      // For dates more than a week away, return the date
      return appointmentDate.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short'
      });
    } catch (err) {
      console.error("Error calculating relative time:", err);
      return "Upcoming";
    }
  }

  if (error) {
    return (
      <div className="w-full h-[600px] rounded-lg bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center p-6 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 text-red-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Calendar Error</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Make sure you've entered a valid Cal.com username (e.g., "johndoe" if your Cal.com URL is cal.com/johndoe)
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'calendar'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('list')}
        >
          Upcoming Appointments
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <div className="w-full h-[600px] rounded-lg overflow-hidden bg-white dark:bg-gray-800">
          {renderCalEmbed()}
        </div>
      ) : (
        <div className="w-full rounded-lg bg-white dark:bg-gray-800">
          {loading ? (
            <div className="p-6 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              {!calApiKey && (
                <div className="p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    To view your appointments, please provide your Cal.com API key in the calendar settings.
                  </p>
                </div>
              )}
              
              {calApiKey && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Your Upcoming Appointments
                  </h3>
                  <button
                    onClick={handleRefresh}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 mr-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              )}
              
              {appointments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {calApiKey 
                      ? "No upcoming appointments found." 
                      : "Connect your Cal.com API key to view your appointments."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.map(appointment => (
                    <li key={appointment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{appointment.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(appointment.startTime)}
                          </p>
                          {appointment.attendees.length > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              With: {appointment.attendees.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {getRelativeTime(appointment.startTime)}
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(appointment.startTime).toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {new Date(appointment.endTime).toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 