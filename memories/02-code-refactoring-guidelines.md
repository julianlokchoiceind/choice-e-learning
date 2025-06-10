# Code Refactoring Guidelines

No backward compatibility needed when refactoring. Follow Domain-Driven Design principles. Use alias imports (@/client/, @/server/, @/shared/). Update index.ts files for exports. Implement full error handling and type safety. Remove redundant code.

## Key Principles:
1. **No Backward Compatibility**: Freely remove unnecessary code for optimization
2. **Domain-Driven Design**: Organize code by business domains
3. **Alias Imports**: Always use @/client/, @/server/, @/shared/
4. **Export Management**: Update index.ts files for proper exports
5. **Error Handling**: Implement comprehensive error handling
6. **Type Safety**: Ensure clear TypeScript type definitions
7. **Code Cleanup**: Remove redundant and unnecessary code
8. **No Feature Flags**: Don't use feature flags for transitions
9. **Project Structure**: Follow established project structure guidelines 