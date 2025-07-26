// User service types
import { z } from 'zod';

// User profile data schema (database)
export const UserProfileDataSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  companyName: z.string().nullable(),
  mobileNumber: z.string().nullable(),
  information: z.string().nullable(),
  calUsername: z.string().nullable(),
  calApiKey: z.string().nullable(),
  calEventTypeId: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// User profile update schema
export const UserProfileUpdateSchema = z.object({
  name: z.string().optional(),
  companyName: z.string().optional(),
  mobileNumber: z.string().optional(),
  information: z.string().optional(),
  calUsername: z.string().optional(),
  calApiKey: z.string().optional(),
  calEventTypeId: z.string().optional(),
});

// Cal.com credentials schema
export const CalCredentialsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  apiKey: z.string().min(1, 'API key is required'),
  eventTypeId: z.string().optional(),
});

// Cal.com event type schema
export const CalEventTypeSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  length: z.number(),
  description: z.string().nullable(),
  hidden: z.boolean(),
  userId: z.number(),
});

// Cal.com validation result
export const CalValidationSchema = z.object({
  isValid: z.boolean(),
  username: z.string(),
  eventTypes: z.array(CalEventTypeSchema),
  error: z.string().nullable(),
});

// User preferences schema
export const UserPreferencesSchema = z.object({
  theme: z.string().default('default'),
  language: z.string().default('nl'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(false),
    dataSharing: z.boolean().default(false),
  }),
});

// User subscription info schema
export const UserSubscriptionSchema = z.object({
  id: z.string(),
  status: z.enum(['active', 'inactive', 'canceled', 'past_due']),
  plan: z.enum(['basic', 'pro', 'enterprise']),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
});

// User service operation result
export const UserOperationResultSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  data: z.any().optional(),
});

// Export types
export type UserProfileData = z.infer<typeof UserProfileDataSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type CalCredentials = z.infer<typeof CalCredentialsSchema>;
export type CalEventType = z.infer<typeof CalEventTypeSchema>;
export type CalValidation = z.infer<typeof CalValidationSchema>;
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type UserSubscription = z.infer<typeof UserSubscriptionSchema>;
export type UserOperationResult = z.infer<typeof UserOperationResultSchema>;

// User analytics data
export interface UserAnalytics {
  totalVoicemails: number;
  totalTranscriptions: number;
  lastLoginAt: Date;
  averageSessionDuration: number;
  mostUsedFeatures: string[];
  engagementScore: number;
}

// User activity log entry
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// User service configuration
export interface UserServiceConfig {
  defaultPreferences: UserPreferences;
  calApiUrl: string;
  analyticsEnabled: boolean;
  activityLogRetention: number; // days
  profileValidation: {
    nameRequired: boolean;
    phoneRequired: boolean;
    companyRequired: boolean;
  };
}