/**
 * Input sanitization and security utilities for VoicemailAI PWA
 * Implements DOMPurify integration, prompt injection detection, and rate limiting
 */

import DOMPurify from 'dompurify';
import { z } from 'zod';

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripComments?: boolean;
  stripScripts?: boolean;
}

class SecuritySanitizationService {
  private defaultRateLimit: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  };

  private agentChatRateLimit: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  };

  // Prompt injection patterns
  private injectionPatterns = [
    // System prompt attempts
    /\b(system|assistant|user)\s*[:=]\s*/gi,
    /\b(prompt|instruction|role)\s*[:=]\s*/gi,
    
    // Command injection attempts
    /\b(ignore|forget|disregard)\s+(previous|above|all|everything)/gi,
    /\bnow\s+(act|behave|pretend|roleplay)\s+as/gi,
    /\byou\s+are\s+(now|no\s+longer)/gi,
    
    // Data extraction attempts
    /\b(show|display|print|output|reveal)\s+(your|the)\s+(prompt|instruction|system)/gi,
    /\btell\s+me\s+(about\s+)?(your|the)\s+(prompt|instruction|role)/gi,
    
    // Override attempts
    /\boverride\s+(security|safety|filter)/gi,
    /\bbypass\s+(filter|security|safety)/gi,
    
    // Social engineering
    /\bpretend\s+(this|that)\s+is/gi,
    /\bimagine\s+(if|that)\s+you/gi,
    
    // Code execution attempts
    /<script[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    
    // SQL injection patterns
    /('\s*(or|and)\s*')|('\s*(union|select|insert|update|delete|drop)\s+)/gi,
    
    // XSS patterns
    /<[^>]*?(javascript|vbscript|onload|onerror|onclick).*?>/gi,
  ];

  /**
   * Sanitize HTML content using DOMPurify
   */
  sanitizeHtml(content: string, options: SanitizationOptions = {}): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    const {
      allowedTags = ['p', 'br', 'strong', 'em', 'u', 'i', 'span'],
      allowedAttributes = ['class'],
      stripComments = true,
      stripScripts = true
    } = options;

    try {
      // Configure DOMPurify
      const config = {
        ALLOWED_TAGS: allowedTags,
        ALLOWED_ATTR: allowedAttributes,
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        FORBID_TAGS: stripScripts ? ['script', 'style', 'iframe', 'object', 'embed'] : [],
        FORBID_ATTR: ['onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'href', 'src'],
        REMOVE_TAGS: stripComments ? ['comment'] : [],
        USE_PROFILES: { html: true }
      };

      return DOMPurify.sanitize(content, config);
    } catch (error) {
      console.error('HTML sanitization failed:', error);
      // Return empty string on sanitization failure
      return '';
    }
  }

  /**
   * Detect potential prompt injection attempts
   */
  detectPromptInjection(input: string): {
    isInjection: boolean;
    patterns: string[];
    riskLevel: 'low' | 'medium' | 'high';
  } {
    if (!input || typeof input !== 'string') {
      return { isInjection: false, patterns: [], riskLevel: 'low' };
    }

    const detectedPatterns: string[] = [];
    const inputLower = input.toLowerCase();

    // Check against known injection patterns
    for (const pattern of this.injectionPatterns) {
      if (pattern.test(input)) {
        detectedPatterns.push(pattern.toString());
      }
    }

    // Additional heuristics
    const suspiciousKeywords = [
      'system prompt', 'ignore instructions', 'act as', 'pretend to be',
      'you are now', 'new instructions', 'override', 'jailbreak'
    ];

    for (const keyword of suspiciousKeywords) {
      if (inputLower.includes(keyword)) {
        detectedPatterns.push(keyword);
      }
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (detectedPatterns.length >= 3) {
      riskLevel = 'high';
    } else if (detectedPatterns.length >= 1) {
      riskLevel = 'medium';
    }

    return {
      isInjection: detectedPatterns.length > 0,
      patterns: detectedPatterns,
      riskLevel
    };
  }

  /**
   * Sanitize user input for AI prompts
   */
  sanitizePromptInput(input: string): {
    sanitizedInput: string;
    blocked: boolean;
    reason?: string;
  } {
    if (!input || typeof input !== 'string') {
      return { sanitizedInput: '', blocked: false };
    }

    // Check for prompt injection
    const injectionCheck = this.detectPromptInjection(input);
    
    if (injectionCheck.isInjection && injectionCheck.riskLevel === 'high') {
      return {
        sanitizedInput: '',
        blocked: true,
        reason: 'Potential prompt injection detected'
      };
    }

    // Basic input cleaning
    let sanitized = input
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 2000); // Limit length

    // Remove potentially dangerous patterns
    sanitized = sanitized
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    return {
      sanitizedInput: sanitized,
      blocked: false
    };
  }

  /**
   * Rate limiting implementation
   */
  checkRateLimit(
    identifier: string, 
    endpoint: string = 'default',
    customConfig?: Partial<RateLimitConfig>
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = `${endpoint}:${identifier}`;
    const now = Date.now();
    
    // Get rate limit config
    const config = endpoint === 'agent-chat' 
      ? this.agentChatRateLimit 
      : this.defaultRateLimit;
    
    const finalConfig = { ...config, ...customConfig };
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + finalConfig.windowMs
      };
    }

    // Check if rate limit exceeded
    if (entry.count >= finalConfig.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment counter and update store
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: finalConfig.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Validate API request structure using Zod schemas
   */
  validateAgentChatRequest = z.object({
    message: z.string().min(1).max(2000),
    sessionId: z.string().min(1).max(100),
    context: z.object({
      business: z.object({
        name: z.string().optional(),
        services: z.array(z.string()).optional(),
        pricing: z.record(z.number()).optional(),
        availability: z.string().optional(),
        contact: z.string().optional()
      }).optional(),
      recentTranscriptions: z.array(z.any()).optional(),
      activeActions: z.array(z.any()).optional()
    }).optional()
  });

  /**
   * Sanitize AI response content
   */
  sanitizeAiResponse(response: string): string {
    if (!response || typeof response !== 'string') {
      return '';
    }

    // Remove potential malicious content from AI responses
    let sanitized = this.sanitizeHtml(response, {
      allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      allowedAttributes: [],
      stripComments: true,
      stripScripts: true
    });

    // Additional response cleaning
    sanitized = sanitized
      .replace(/javascript\s*:/gi, '')
      .replace(/data\s*:/gi, '')
      .replace(/vbscript\s*:/gi, '');

    return sanitized;
  }

  /**
   * Log security events (without sensitive data)
   */
  logSecurityEvent(event: {
    type: 'rate_limit' | 'injection_attempt' | 'validation_failure' | 'sanitization';
    endpoint: string;
    userId?: string;
    severity: 'low' | 'medium' | 'high';
    details?: any;
  }): void {
    // In production, this should send to a security monitoring service
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: event.type,
      endpoint: event.endpoint,
      userId: event.userId ? `user_${event.userId.substring(0, 8)}...` : 'anonymous',
      severity: event.severity,
      details: event.details
    };

    console.warn('Security Event:', logEntry);

    // TODO: Integrate with security monitoring service
    // await securityMonitoringService.log(logEntry);
  }

  /**
   * Clean up expired rate limit entries
   */
  cleanupRateLimits(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// Export singleton instance
export const securitySanitization = new SecuritySanitizationService();

// Export types
export type { SanitizationOptions, RateLimitConfig };