'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Copy, ChevronDown, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayTimeBlocks {
  [key: string]: TimeBlock[];
}

interface MobileTimeBlockingSettingsProps {
  userId: string;
}

export default function MobileTimeBlockingSettings({ userId }: MobileTimeBlockingSettingsProps) {
  const [timeBlocks, setTimeBlocks] = useState<DayTimeBlocks>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [targetDay, setTargetDay] = useState<string>('');

  const daysOfWeek = [
    { key: 'monday', label: 'Maandag', icon: '📅' },
    { key: 'tuesday', label: 'Dinsdag', icon: '📅' },
    { key: 'wednesday', label: 'Woensdag', icon: '📅' },
    { key: 'thursday', label: 'Donderdag', icon: '📅' },
    { key: 'friday', label: 'Vrijdag', icon: '📅' },
    { key: 'saturday', label: 'Zaterdag', icon: '🏖️' },
    { key: 'sunday', label: 'Zondag', icon: '🏖️' }
  ];

  // Generate time options (30-minute intervals)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Load existing time blocks (placeholder - you'll need to implement the API)
  useEffect(() => {
    const loadTimeBlocks = async () => {
      // TODO: Implement API call to load existing time blocks
      // For now, we'll start with empty blocks
      console.log('Loading time blocks for user:', userId);
    };

    if (userId) {
      loadTimeBlocks();
    }
  }, [userId]);

  // Preset time blocks with mobile-friendly icons
  const presetBlocks = [
    { 
      label: '🍽️ Lunch', 
      sublabel: '12:00 - 13:00',
      startTime: '12:00', 
      endTime: '13:00',
      color: 'bg-orange-100 text-orange-800'
    },
    { 
      label: '☕ Ochtendpauze', 
      sublabel: '10:00 - 10:30',
      startTime: '10:00', 
      endTime: '10:30',
      color: 'bg-brown-100 text-brown-800'
    },
    { 
      label: '🍵 Middagpauze', 
      sublabel: '15:00 - 15:30',
      startTime: '15:00', 
      endTime: '15:30',
      color: 'bg-green-100 text-green-800'
    },
    { 
      label: '🌅 Vroege ochtend', 
      sublabel: '06:00 - 09:00',
      startTime: '06:00', 
      endTime: '09:00',
      color: 'bg-yellow-100 text-yellow-800'
    },
    { 
      label: '🌙 Late avond', 
      sublabel: '18:00 - 22:00',
      startTime: '18:00', 
      endTime: '22:00',
      color: 'bg-purple-100 text-purple-800'
    },
    { 
      label: '🏠 Thuis werken', 
      sublabel: '09:00 - 17:00',
      startTime: '09:00', 
      endTime: '17:00',
      color: 'bg-blue-100 text-blue-800'
    }
  ];

  // Add a new time block for a specific day
  const addTimeBlock = (day: string, preset?: { startTime: string; endTime: string }) => {
    const newBlock: TimeBlock = {
      id: `${day}-${Date.now()}`,
      startTime: preset?.startTime || '09:00',
      endTime: preset?.endTime || '10:00'
    };

    setTimeBlocks(prev => ({
      ...prev,
      [day]: [...prev[day], newBlock]
    }));
  };

  // Remove a time block
  const removeTimeBlock = (day: string, blockId: string) => {
    setTimeBlocks(prev => ({
      ...prev,
      [day]: prev[day].filter(block => block.id !== blockId)
    }));
  };

  // Update a time block
  const updateTimeBlock = (day: string, blockId: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeBlocks(prev => ({
      ...prev,
      [day]: prev[day].map(block => 
        block.id === blockId 
          ? { ...block, [field]: value }
          : block
      )
    }));
  };

  // Validate time blocks
  const validateTimeBlocks = () => {
    for (const day of Object.keys(timeBlocks)) {
      for (const block of timeBlocks[day]) {
        if (block.startTime >= block.endTime) {
          toast.error(`Eindtijd moet na starttijd zijn voor ${daysOfWeek.find(d => d.key === day)?.label}`);
          return false;
        }
      }
    }
    return true;
  };

  // Copy time blocks to other days
  const copyToDay = (fromDay: string, toDay: string) => {
    const blocksToeCopy = timeBlocks[fromDay];
    if (blocksToeCopy.length === 0) {
      toast.info('Geen tijdblokken om te kopiëren');
      return;
    }

    setTimeBlocks(prev => {
      const copiedBlocks = blocksToeCopy.map(block => ({
        ...block,
        id: `${toDay}-${Date.now()}-${Math.random()}`
      }));
      
      return {
        ...prev,
        [toDay]: [...prev[toDay], ...copiedBlocks]
      };
    });
    
    toast.success(`Tijdblokken gekopieerd naar ${daysOfWeek.find(d => d.key === toDay)?.label}!`);
  };

  // Copy to all weekdays
  const copyToWeekdays = (fromDay: string) => {
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const otherWeekdays = weekdays.filter(day => day !== fromDay);
    
    otherWeekdays.forEach(day => {
      copyToDay(fromDay, day);
    });
  };

  // Save time blocks
  const saveTimeBlocks = async () => {
    if (!validateTimeBlocks()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to save time blocks
      console.log('Saving time blocks:', timeBlocks);
      
      // Placeholder for API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Geblokkeerde tijden zijn opgeslagen!');
    } catch (error) {
      console.error('Error saving time blocks:', error);
      toast.error('Er is een fout opgetreden bij het opslaan.');
    } finally {
      setLoading(false);
    }
  };

  // Handle preset selection
  const handlePresetSelect = (preset: any) => {
    if (targetDay) {
      addTimeBlock(targetDay, preset);
      setShowPresets(false);
      setTargetDay('');
      setSelectedPreset(null);
    }
  };

  // Show preset modal for a specific day
  const showPresetsForDay = (day: string) => {
    setTargetDay(day);
    setShowPresets(true);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Geblokkeerde Tijden
            </h2>
            <p className="text-sm text-gray-600">
              Tijden waarin je niet beschikbaar bent
            </p>
          </div>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-3 mb-6">
        {daysOfWeek.map((day) => {
          const isExpanded = expandedDay === day.key;
          const blockCount = timeBlocks[day.key].length;
          
          return (
            <motion.div
              key={day.key}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Day Header */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setExpandedDay(isExpanded ? null : day.key)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{day.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{day.label}</h3>
                    <p className="text-sm text-gray-500">
                      {blockCount === 0 ? 'Geen blokkeringen' : `${blockCount} blok${blockCount === 1 ? '' : 'ken'}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {blockCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToWeekdays(day.key);
                        }}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                        title="Kopieer naar werkdagen"
                      >
                        <Copy className="w-4 h-4 text-gray-600" />
                      </motion.button>
                    </div>
                  )}
                  
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </motion.button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4 space-y-3">
                      {/* Existing Time Blocks */}
                      {timeBlocks[day.key].map((block) => (
                        <motion.div
                          key={block.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Van
                              </label>
                              <select
                                value={block.startTime}
                                onChange={(e) => updateTimeBlock(day.key, block.id, 'startTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                {timeOptions.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tot
                              </label>
                              <select
                                value={block.endTime}
                                onChange={(e) => updateTimeBlock(day.key, block.id, 'endTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                {timeOptions.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeTimeBlock(day.key, block.id)}
                            className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                            title="Verwijder tijdblok"
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </motion.div>
                      ))}

                      {/* Add Buttons */}
                      <div className="flex space-x-2">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addTimeBlock(day.key)}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm font-medium">Custom</span>
                        </motion.button>
                        
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => showPresetsForDay(day.key)}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Snelkeuze</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={saveTimeBlocks}
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Opslaan...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Check className="w-5 h-5" />
            <span>Tijdblokken Opslaan</span>
          </div>
        )}
      </motion.button>

      {/* Presets Modal */}
      <AnimatePresence>
        {showPresets && (
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
              className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Snelkeuze Tijdblokken
                </h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPresets(false)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              
              <div className="space-y-3">
                {presetBlocks.map((preset, index) => (
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${preset.color} border-transparent hover:border-current`}
                  >
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-sm opacity-75">{preset.sublabel}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}