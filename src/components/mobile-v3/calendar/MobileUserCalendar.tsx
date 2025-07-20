'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, PanInfo, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, X, Clock, MapPin, FileText, Users, Edit } from 'lucide-react';
import { toast } from 'react-toastify';

interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees?: string;
  all_day: boolean;
  priority: string;
  color: string;
  status: string;
  reminder_minutes: number;
  recurrence_type: string;
  user_id: string;
  created_at: string;
}

interface MobileUserCalendarProps {
  userId: string;
}

export default function MobileUserCalendar({ userId }: MobileUserCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  
  // Enhanced date/time picker state
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    allDay: false,
    attendees: '',
    reminder: '15',
    recurrence: 'none',
    priority: 'medium',
    color: 'blue'
  });

  // Generate time options for dropdowns (30-minute intervals)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('nl-NL', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Smart date/time handling
  const updateStartDateTime = (date: string, time: string) => {
    setStartDate(date);
    setStartTime(time);
    
    if (date && time) {
      const startDateTime = `${date}T${time}`;
      setNewEvent(prev => ({ ...prev, startTime: startDateTime }));
      
      // Auto-set end time to 1 hour later if end time is not set or earlier than start
      if (!endDate || !endTime || new Date(`${endDate}T${endTime}`) <= new Date(startDateTime)) {
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + 1);
        
        const newEndDate = endDateTime.toISOString().split('T')[0];
        const newEndTime = endDateTime.toTimeString().slice(0, 5);
        
        setEndDate(newEndDate);
        setEndTime(newEndTime);
        setNewEvent(prev => ({ ...prev, endTime: `${newEndDate}T${newEndTime}` }));
      }
    }
  };

  const updateEndDateTime = (date: string, time: string) => {
    setEndDate(date);
    setEndTime(time);
    
    if (date && time) {
      setNewEvent(prev => ({ ...prev, endTime: `${date}T${time}` }));
    }
  };

  // Initialize dates when modal opens
  const initializeDateTimes = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    
    // Round to next 30-minute interval
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 30) * 30;
    now.setMinutes(roundedMinutes, 0, 0);
    
    const currentTime = now.toTimeString().slice(0, 5);
    
    // Set end time 1 hour later
    const endDateTime = new Date(now);
    endDateTime.setHours(endDateTime.getHours() + 1);
    const endDateStr = endDateTime.toISOString().split('T')[0];
    const endTimeStr = endDateTime.toTimeString().slice(0, 5);
    
    updateStartDateTime(currentDate, currentTime);
    updateEndDateTime(endDateStr, endTimeStr);
  };

  // Reset form when modal closes
  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      allDay: false,
      attendees: '',
      reminder: '15',
      recurrence: 'none',
      priority: 'medium',
      color: 'blue'
    });
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
  };

  // Initialize date/time when modal opens, reset when it closes
  useEffect(() => {
    if (showAddModal) {
      initializeDateTimes();
    } else {
      resetForm();
    }
  }, [showAddModal]);

  // Fetch events from agenda_events API
  useEffect(() => {
    const fetchEvents = async () => {
      if (!userId) {
        console.log('Debug: No userId provided');
        return;
      }
      
      console.log('Debug: Fetching events for userId:', userId);
      setLoading(true);
      try {
        const response = await fetch(`/api/agenda-events?userId=${userId}`);
        console.log('Debug: agenda_events response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Debug: agenda_events data:', data);
          setEvents(data.events || []);
        } else {
          const errorText = await response.text();
          console.error('Error fetching events:', errorText);
          // Show empty calendar if API fails
          setEvents([]);
          toast.error('Kon geen afspraken laden. Probeer later opnieuw.');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
        toast.error('Er is een fout opgetreden bij het laden van afspraken.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  // Navigation functions
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Format time for display
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: nl });
  };

  // Get color class for event
  const getEventColorClass = (color: string, isCurrentDay: boolean = false) => {
    const colorMap: { [key: string]: { normal: string; current: string } } = {
      blue: { 
        normal: 'bg-blue-100 text-blue-800',
        current: 'bg-blue-700 text-white'
      },
      red: { 
        normal: 'bg-red-100 text-red-800',
        current: 'bg-red-700 text-white'
      },
      green: { 
        normal: 'bg-green-100 text-green-800',
        current: 'bg-green-700 text-white'
      },
      yellow: { 
        normal: 'bg-yellow-100 text-yellow-800',
        current: 'bg-yellow-700 text-white'
      },
      purple: { 
        normal: 'bg-purple-100 text-purple-800',
        current: 'bg-purple-700 text-white'
      },
      orange: { 
        normal: 'bg-orange-100 text-orange-800',
        current: 'bg-orange-700 text-white'
      }
    };

    const colorClasses = colorMap[color] || colorMap.blue;
    return isCurrentDay ? colorClasses.current : colorClasses.normal;
  };

  // Handle creating new event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast.error('Vul alle verplichte velden in.');
      return;
    }

    // Validate dates
    const startDate = new Date(newEvent.startTime);
    const endDate = new Date(newEvent.endTime);
    
    if (startDate >= endDate) {
      toast.error('Eindtijd moet na starttijd zijn.');
      return;
    }

    try {
      const requestData = {
        userId,
        title: newEvent.title,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        location: newEvent.location,
        allDay: newEvent.allDay,
        attendees: newEvent.attendees,
        reminder: newEvent.reminder,
        recurrence: newEvent.recurrence,
        priority: newEvent.priority,
        color: newEvent.color
      };

      console.log('Creating event with data:', requestData);

      const response = await fetch('/api/agenda-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create event error response:', errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          toast.error(`Fout: ${errorJson.error || 'Onbekende fout'}`);
        } catch {
          toast.error(`HTTP ${response.status}: ${errorText}`);
        }
        return;
      }

      const data = await response.json();
      console.log('Event created successfully:', data);
      
      setEvents(prev => [...prev, data.event]);

      setShowAddModal(false);
      resetForm();
      toast.success('Afspraak succesvol toegevoegd!');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Er is een fout opgetreden bij het toevoegen van de afspraak.');
    }
  };

  // Handle deleting event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/agenda-events?id=${eventId}&userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Afspraak succesvol verwijderd!');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen van de afspraak.');
    }
  };

  // Handle editing event
  const handleEditEvent = (event: AgendaEvent) => {
    setEditingEvent(event);
    
    // Pre-populate the form with existing event data
    const startDateTime = new Date(event.start_time);
    const endDateTime = new Date(event.end_time);
    
    const startDateStr = startDateTime.toISOString().split('T')[0];
    const startTimeStr = startDateTime.toTimeString().slice(0, 5);
    const endDateStr = endDateTime.toISOString().split('T')[0];
    const endTimeStr = endDateTime.toTimeString().slice(0, 5);
    
    setStartDate(startDateStr);
    setStartTime(startTimeStr);
    setEndDate(endDateStr);
    setEndTime(endTimeStr);
    
    setNewEvent({
      title: event.title,
      description: event.description || '',
      startTime: event.start_time,
      endTime: event.end_time,
      location: event.location || '',
      allDay: event.all_day,
      attendees: event.attendees || '',
      reminder: (event.reminder_minutes || 0).toString(),
      recurrence: event.recurrence_type,
      priority: event.priority,
      color: event.color
    });
    
    setShowEditModal(true);
  };

  // Handle updating event
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEvent) return;
    
    try {
      const eventData = {
        id: editingEvent.id,
        userId: userId,
        title: newEvent.title,
        description: newEvent.description,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        location: newEvent.location,
        allDay: newEvent.allDay,
        attendees: newEvent.attendees,
        priority: newEvent.priority,
        color: newEvent.color,
        reminder: newEvent.reminder,
        recurrence: newEvent.recurrence
      };

      const response = await fetch('/api/agenda-events', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      
      // Update the events list
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent.event : event
      ));

      setShowEditModal(false);
      setEditingEvent(null);
      resetForm();
      toast.success('Afspraak succesvol bijgewerkt!');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Er is een fout opgetreden bij het bijwerken van de afspraak.');
    }
  };

  // Handle month navigation with swipe
  const handleMonthSwipe = (event: any, info: PanInfo) => {
    const { offset } = info;
    const swipeThreshold = 100;

    if (Math.abs(offset.x) > swipeThreshold) {
      if (offset.x > 0) {
        goToPreviousMonth();
      } else {
        goToNextMonth();
      }
    }
  };

  return (
    <div className="blabla-card mx-4 mt-6 overflow-hidden">
      {/* Header */}
      <div className="accent-hero flex justify-between items-center p-4">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-6 w-6 text-white" />
          <h2 className="text-xl font-bold text-white">Jouw Kalender</h2>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">Nieuw</span>
        </motion.button>
      </div>

      {/* Calendar Navigation */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleMonthSwipe}
        className="flex justify-between items-center p-4 bg-gray-50"
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </motion.button>
        
        <h3 className="text-lg font-semibold text-gray-900 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: nl })}
        </h3>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </motion.button>
      </motion.div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[80px] p-2 rounded-lg transition-colors ${
                  isCurrentDay 
                    ? 'bg-blue-600 text-white' 
                    : isCurrentMonth 
                      ? 'bg-white text-gray-900 hover:bg-blue-50' 
                      : 'bg-white text-gray-400'
                } ${
                  isSelected && !isCurrentDay ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate ${getEventColorClass(event.color, isCurrentDay)}`}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {formatTime(event.start_time)}
                      </div>
                    </div>
                  ))}
                  
                  {dayEvents.length > 2 && (
                    <div className={`text-xs text-center ${
                      isCurrentDay 
                        ? 'text-blue-100' 
                        : 'text-gray-500'
                    }`}>
                      +{dayEvents.length - 2} meer
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="p-4 bg-gray-50 border-t">
          <h4 className="font-medium text-gray-900 mb-3">
            {format(selectedDate, 'EEEE d MMMM yyyy', { locale: nl })}
          </h4>
          
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500">Geen afspraken op deze dag</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <motion.div
                  key={event.id}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 bg-white rounded-lg border"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-gray-900">
                          {event.title}
                        </h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${getEventColorClass(event.color)}`}>
                          {event.priority}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {event.all_day ? 'Hele dag' : `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Bewerk afspraak"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Verwijder afspraak"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              className="blabla-card w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Nieuwe Afspraak
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Afspraak titel"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschrijving
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Voeg details toe..."
                  />
                </div>
                
                {/* All Day Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={newEvent.allDay}
                    onChange={(e) => {
                      const isAllDay = e.target.checked;
                      setNewEvent(prev => ({ ...prev, allDay: isAllDay }));
                      
                      // Update times for all-day events
                      if (isAllDay && startDate && endDate) {
                        setNewEvent(prev => ({ 
                          ...prev, 
                          startTime: `${startDate}T00:00`,
                          endTime: `${endDate}T23:59`
                        }));
                      } else if (!isAllDay && startDate && endDate) {
                        // Reset to current time selections
                        if (startTime && endTime) {
                          setNewEvent(prev => ({ 
                            ...prev, 
                            startTime: `${startDate}T${startTime}`,
                            endTime: `${endDate}T${endTime}`
                          }));
                        }
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allDay" className="ml-2 block text-sm text-gray-700">
                    Hele dag
                  </label>
                </div>

                {/* Start Date/Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Start *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => updateStartDateTime(e.target.value, startTime)}
                      className="px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {!newEvent.allDay && (
                      <select
                        value={startTime}
                        onChange={(e) => updateStartDateTime(startDate, e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Tijd</option>
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* End Date/Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Eind *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => updateEndDateTime(e.target.value, endTime)}
                      className="px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {!newEvent.allDay && (
                      <select
                        value={endTime}
                        onChange={(e) => updateEndDateTime(endDate, e.target.value)}
                        className="px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Tijd</option>
                        {timeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locatie
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Vergaderruimte, Zoom, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioriteit
                    </label>
                    <select
                      value={newEvent.priority}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Laag</option>
                      <option value="medium">Gemiddeld</option>
                      <option value="high">Hoog</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kleur
                    </label>
                    <select
                      value={newEvent.color}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="blue">Blauw</option>
                      <option value="red">Rood</option>
                      <option value="green">Groen</option>
                      <option value="yellow">Geel</option>
                      <option value="purple">Paars</option>
                      <option value="orange">Oranje</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Annuleren
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    className="blabla-button-primary px-6 py-3 text-sm font-medium"
                  >
                    Toevoegen
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Event Modal - Similar structure as Add Modal */}
      <AnimatePresence>
        {showEditModal && editingEvent && (
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
              className="blabla-card w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Afspraak Bewerken
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                {/* Same form structure as Add Modal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Annuleren
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    className="blabla-button-primary px-6 py-3 text-sm font-medium"
                  >
                    Bijwerken
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}