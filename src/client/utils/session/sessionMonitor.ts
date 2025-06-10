'use client';

import { Session } from 'next-auth';

/**
 * Session monitoring utility for tracking and logging session-related issues
 * 
 * This utility provides functions to:
 * 1. Log session state changes
 * 2. Track session errors
 * 3. Monitor session expiration
 * 4. Provide debugging information for session issues
 */

// Log levels for session monitoring
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Session event types
export type SessionEventType = 
  | 'session_created'
  | 'session_updated'
  | 'session_expired'
  | 'session_error'
  | 'logout_initiated'
  | 'logout_completed'
  | 'logout_error'
  | 'auth_error';

// Session event data
export interface SessionEvent {
  type: SessionEventType;
  timestamp: number;
  userId?: string;
  message: string;
  data?: any;
}

// Session history to track recent events
const sessionHistory: SessionEvent[] = [];
const MAX_HISTORY_LENGTH = 50;

/**
 * Log a session event with specified level
 * 
 * @param type - Type of session event
 * @param message - Event message
 * @param level - Log level (default: 'info')
 * @param session - Current session if available
 * @param data - Additional data to log
 */
export const logSessionEvent = (
  type: SessionEventType,
  message: string,
  level: LogLevel = 'info',
  session?: Session | null,
  data?: any
): void => {
  const userId = session?.user?.id;
  
  // Create event object
  const event: SessionEvent = {
    type,
    timestamp: Date.now(),
    userId,
    message,
    data
  };
  
  // Add to history, maintaining max length
  sessionHistory.unshift(event);
  if (sessionHistory.length > MAX_HISTORY_LENGTH) {
    sessionHistory.pop();
  }
  
  // Log to console with appropriate level
  const logPrefix = `[Session ${type}]${userId ? ` [User: ${userId}]` : ''}`;
  
  switch (level) {
    case 'debug':
      console.debug(logPrefix, message, data);
      break;
    case 'info':
      console.info(logPrefix, message, data);
      break;
    case 'warn':
      console.warn(logPrefix, message, data);
      break;
    case 'error':
      console.error(logPrefix, message, data);
      break;
  }
  
  // In development, we could send telemetry to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Here we could send to a monitoring service like Sentry
    // This is a placeholder for future implementation
  }
};

/**
 * Log session creation or update
 * 
 * @param session - Current session
 * @param isNew - Whether this is a new session or update
 */
export const logSessionState = (session: Session | null, isNew: boolean = false): void => {
  if (!session) {
    logSessionEvent('session_expired', 'Session is null or undefined', 'warn');
    return;
  }
  
  const type = isNew ? 'session_created' : 'session_updated';
  const message = isNew ? 'New session created' : 'Session updated';
  
  logSessionEvent(type, message, 'info', session, {
    expiresAt: session.expires,
    hasUser: !!session.user
  });
};

/**
 * Log logout process events
 * 
 * @param stage - Stage of logout ('initiated', 'completed', or error message)
 * @param session - Current session if available
 * @param error - Error object if logout failed
 */
export const logLogout = (
  stage: 'initiated' | 'completed' | string,
  session?: Session | null,
  error?: Error
): void => {
  if (stage === 'initiated') {
    logSessionEvent('logout_initiated', 'Logout process started', 'info', session);
  } else if (stage === 'completed') {
    logSessionEvent('logout_completed', 'Logout completed successfully', 'info', session);
  } else if (error) {
    logSessionEvent('logout_error', `Logout error: ${stage}`, 'error', session, {
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Log authentication errors
 * 
 * @param message - Error message
 * @param error - Error object if available
 */
export const logAuthError = (message: string, error?: Error): void => {
  logSessionEvent('auth_error', message, 'error', null, {
    error: error?.message,
    stack: error?.stack
  });
};

/**
 * Get recent session history for debugging
 * 
 * @returns Array of recent session events
 */
export const getSessionHistory = (): SessionEvent[] => {
  return [...sessionHistory];
};

/**
 * Clear session history
 */
export const clearSessionHistory = (): void => {
  sessionHistory.length = 0;
};
