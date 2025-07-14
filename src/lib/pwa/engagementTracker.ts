/**
 * User Engagement Tracker voor PWA Install Prompt Eligibility
 * Implementeert Chrome Android requirements: 30 seconden + user interaction
 */

interface EngagementMetrics {
  startTime: number;
  totalTimeSpent: number;
  interactionCount: number;
  lastInteractionTime: number;
  hasScrolled: boolean;
  hasFocusLoss: boolean;
  pageViews: number;
  isEligible: boolean;
}

interface EngagementThresholds {
  minTimeSpent: number; // 30 seconden voor Chrome
  minInteractions: number; // Minimaal 1 interaction
  maxInactivityGap: number; // Max tijd tussen interactions
}

class EngagementTracker {
  private metrics: EngagementMetrics;
  private thresholds: EngagementThresholds;
  private listeners: Map<string, ((metrics: EngagementMetrics) => void)[]> = new Map();
  private startTime: number;
  private lastActivityTime: number;
  private activityTimer: NodeJS.Timeout | null = null;
  private eligibilityTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startTime = Date.now();
    this.lastActivityTime = this.startTime;
    
    this.metrics = {
      startTime: this.startTime,
      totalTimeSpent: 0,
      interactionCount: 0,
      lastInteractionTime: 0,
      hasScrolled: false,
      hasFocusLoss: false,
      pageViews: 1,
      isEligible: false
    };

    this.thresholds = {
      minTimeSpent: 30 * 1000, // 30 seconden voor Chrome Android
      minInteractions: 1, // Minimaal 1 click/tap
      maxInactivityGap: 5 * 60 * 1000 // 5 minuten max inactiviteit
    };

    this.setupEventListeners();
    this.startTracking();
  }

  /**
   * Setup event listeners voor user interactions
   */
  private setupEventListeners(): void {
    // Only setup listeners on client-side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Click/Touch interactions
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    interactionEvents.forEach(event => {
      document.addEventListener(event, this.handleInteraction.bind(this), { passive: true });
    });

    // Scroll tracking
    document.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

    // Focus/blur tracking voor tab switches
    window.addEventListener('focus', this.handleFocus.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));

    // Page visibility API
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Before unload voor time spent calculation
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  /**
   * Handle user interactions (clicks, touches, keyboard)
   */
  private handleInteraction(event: Event): void {
    const now = Date.now();
    this.lastActivityTime = now;
    this.metrics.lastInteractionTime = now;
    this.metrics.interactionCount++;

    console.log(`📱 User interaction detected: ${event.type} (count: ${this.metrics.interactionCount})`);
    
    this.updateMetrics();
    this.checkEligibility();
  }

  /**
   * Handle scroll events
   */
  private handleScroll(): void {
    if (!this.metrics.hasScrolled) {
      this.metrics.hasScrolled = true;
      this.lastActivityTime = Date.now();
      console.log('📱 User scroll detected');
      this.updateMetrics();
    }
  }

  /**
   * Handle window focus
   */
  private handleFocus(): void {
    console.log('📱 Window focused - resuming tracking');
    this.lastActivityTime = Date.now();
    this.resumeTracking();
  }

  /**
   * Handle window blur
   */
  private handleBlur(): void {
    console.log('📱 Window blurred - pausing tracking');
    this.metrics.hasFocusLoss = true;
    this.pauseTracking();
    this.updateMetrics();
  }

  /**
   * Handle visibility change (tab switch, minimize, etc.)
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      console.log('📱 Page hidden - pausing tracking');
      this.pauseTracking();
    } else {
      console.log('📱 Page visible - resuming tracking');
      this.resumeTracking();
    }
    this.updateMetrics();
  }

  /**
   * Handle before unload
   */
  private handleBeforeUnload(): void {
    this.updateMetrics();
    console.log('📱 Final engagement metrics:', this.metrics);
  }

  /**
   * Start continuous tracking
   */
  private startTracking(): void {
    // Only start tracking on client-side
    if (typeof window === 'undefined') {
      return;
    }

    this.activityTimer = setInterval(() => {
      this.updateMetricsInternal();
      this.checkEligibility();
    }, 1000); // Update elke seconde

    // Check eligibility na minimum tijd
    this.eligibilityTimer = setTimeout(() => {
      this.checkEligibility();
      if (this.metrics.isEligible) {
        this.emit('eligible-for-prompt', this.metrics);
      }
    }, this.thresholds.minTimeSpent);
  }

  /**
   * Pause tracking (bij tab switch, blur, etc.)
   */
  private pauseTracking(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  /**
   * Resume tracking
   */
  private resumeTracking(): void {
    if (!this.activityTimer) {
      this.startTracking();
    }
  }

  /**
   * Update metrics calculation (internal, no events)
   */
  private updateMetricsInternal(): void {
    const now = Date.now();
    
    // Calculate total time spent (excluding inactive periods)
    if (typeof document !== 'undefined' && !document.hidden && document.hasFocus()) {
      this.metrics.totalTimeSpent = now - this.metrics.startTime;
    }
  }

  /**
   * Update metrics calculation (with events)
   */
  private updateMetrics(): void {
    this.updateMetricsInternal();
    this.emit('metrics-updated', this.metrics);
  }

  /**
   * Check if user is eligible for install prompt
   */
  private checkEligibility(): boolean {
    const timeRequirementMet = this.metrics.totalTimeSpent >= this.thresholds.minTimeSpent;
    const interactionRequirementMet = this.metrics.interactionCount >= this.thresholds.minInteractions;
    
    // Additional quality checks
    const hasRealEngagement = this.metrics.hasScrolled || this.metrics.interactionCount >= 3;
    const notTooMuchInactivity = (Date.now() - this.lastActivityTime) < this.thresholds.maxInactivityGap;
    
    const wasEligible = this.metrics.isEligible;
    this.metrics.isEligible = timeRequirementMet && 
                             interactionRequirementMet && 
                             hasRealEngagement && 
                             notTooMuchInactivity;

    // Trigger event als eligibility status verandert
    if (!wasEligible && this.metrics.isEligible) {
      console.log('🎉 User is now eligible for PWA install prompt!', {
        timeSpent: Math.round(this.metrics.totalTimeSpent / 1000) + 's',
        interactions: this.metrics.interactionCount,
        hasScrolled: this.metrics.hasScrolled
      });
      this.emit('became-eligible', this.metrics);
    }

    return this.metrics.isEligible;
  }

  /**
   * Get current engagement metrics
   */
  getMetrics(): EngagementMetrics {
    // Don't call updateMetrics here to avoid infinite loop
    return { ...this.metrics };
  }

  /**
   * Check if user is currently eligible for install prompt
   */
  isEligibleForInstallPrompt(): boolean {
    return this.checkEligibility();
  }

  /**
   * Get engagement summary for debugging
   */
  getSummary(): string {
    // Use metrics directly to avoid infinite loop
    const timeInSeconds = Math.round(this.metrics.totalTimeSpent / 1000);
    
    return `Engagement: ${timeInSeconds}s active, ${this.metrics.interactionCount} interactions, ` +
           `${this.metrics.hasScrolled ? 'scrolled' : 'no scroll'}, ` +
           `${this.metrics.isEligible ? 'ELIGIBLE' : 'not eligible'} for install prompt`;
  }

  /**
   * Reset tracking (for testing/development)
   */
  reset(): void {
    this.startTime = Date.now();
    this.lastActivityTime = this.startTime;
    
    this.metrics = {
      startTime: this.startTime,
      totalTimeSpent: 0,
      interactionCount: 0,
      lastInteractionTime: 0,
      hasScrolled: false,
      hasFocusLoss: false,
      pageViews: this.metrics.pageViews + 1,
      isEligible: false
    };

    console.log('🔄 Engagement tracking reset');
    this.emit('tracking-reset', this.metrics);
  }

  /**
   * Event listener management
   */
  on(event: string, callback: (metrics: EngagementMetrics) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (metrics: EngagementMetrics) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, metrics: EngagementMetrics): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error(`Engagement Tracker: Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }
    if (this.eligibilityTimer) {
      clearTimeout(this.eligibilityTimer);
    }
    
    // Remove event listeners
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    interactionEvents.forEach(event => {
      document.removeEventListener(event, this.handleInteraction.bind(this));
    });
    
    document.removeEventListener('scroll', this.handleScroll.bind(this));
    window.removeEventListener('focus', this.handleFocus.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
    
    this.listeners.clear();
    console.log('🧹 Engagement tracker destroyed');
  }
}

// Export singleton instance
export const engagementTracker = new EngagementTracker();

// Export types
export type { EngagementMetrics, EngagementThresholds };