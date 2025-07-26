// Main services export file
export * from './authService';
export * from './apiService';
export * from './userService';
export * from './transcriptionService';
export * from './mobileService';

// Export types
export * from './types/auth';
export * from './types/api';
export * from './types/user';

// Re-export commonly used services and functions
export {
  AuthService,
  type AuthState,
  type LoginCredentials,
  type RegisterData,
  type AuthResult,
} from './authService';

export {
  ApiService,
  type ApiResponse,
  type RequestConfig,
  type HttpMethod,
} from './apiService';

export {
  UserService,
  type UserProfileData,
  type UserProfileUpdate,
  type CalCredentials,
  type UserPreferences,
} from './userService';

export {
  TranscriptionService,
  type CallTranscription,
  type TranscriptSegment,
  type TranscriptionFilters,
} from './transcriptionService';

export {
  MobileService,
  type MobileConfig,
  type PWAConfig,
  type MobileServiceResult,
} from './mobileService';