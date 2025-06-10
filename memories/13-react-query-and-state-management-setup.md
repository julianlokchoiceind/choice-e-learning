# React Query and State Management Setup

React Query (@tanstack/react-query) is properly configured with QueryProvider including optimized caching strategies, error handling with toast notifications, DevTools support, and data lifetime constants (STATIC, REFERENCE, STANDARD, DYNAMIC, REALTIME). Providers include: AppProvider, QueryProvider, SessionProvider, ToastProvider. No usage found in codebase yet - system ready for implementation.

## React Query Configuration:

### QueryProvider Features:
- **Optimized Caching**: Multiple caching strategies based on data types
- **Error Handling**: Automatic toast notifications for errors
- **DevTools Support**: Development tools for debugging
- **Network Status**: Optional network status indicators

### Data Lifetime Constants:
- **STATIC**: 24 hours stale, 7 days cache (enums, constants)
- **REFERENCE**: 1 hour stale, 24 hours cache (topics, categories)
- **STANDARD**: 5 minutes stale, 30 minutes cache (courses, FAQs)
- **DYNAMIC**: 30 seconds stale, 5 minutes cache (user profile, notifications)
- **REALTIME**: Always stale, 1 minute cache (chat, active users)

## Available Providers:

### AppProvider:
- Main application provider wrapper

### QueryProvider:
- React Query configuration and context
- Global error handling
- Cache management
- DevTools integration

### SessionProvider:
- Authentication session management

### ToastProvider:
- Toast notification system
- Error and success messaging

## Current Status:
- **Infrastructure**: Fully configured and ready
- **Implementation**: Not yet used in components
- **Migration**: Ready for converting from current API patterns
- **Configuration**: Optimized for e-learning platform needs

## Usage Guidelines:
- Use appropriate data lifetime constants based on data volatility
- Leverage automatic error handling
- Utilize cache optimization strategies
- Follow established patterns when implementing 