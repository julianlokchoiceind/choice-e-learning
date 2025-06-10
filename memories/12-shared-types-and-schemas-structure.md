# Shared Types and Schemas Structure

Shared types by domain: achievement/, api/, auth/, common/, courses/, faq/, files/, lessons/, progress/, students/, topics/, user/. Schemas available for: auth/, challenges/, common/, courses/, faq/, lessons/, roadmap/, students/, topics/. All use TypeScript and Zod for validation. Constants include courses/ specific constants.

## Types by Domain:

### Achievement:
- **achievement/** - Achievement and progress types

### API:
- **api/** - API request/response types

### Auth:
- **auth/** - Authentication and authorization types

### Common:
- **common/** - Shared utility types

### Courses:
- **courses/** - Course-related types

### FAQ:
- **faq/** - FAQ content types

### Files:
- **files/** - File handling types

### Lessons:
- **lessons/** - Lesson content types

### Progress:
- **progress/** - Learning progress types

### Students:
- **students/** - Student profile types

### Topics:
- **topics/** - Topic organization types

### User:
- **user/** - User account types

## Schemas Available:

### Validation Schemas:
- **auth/** - Authentication validation
- **challenges/** - Challenge validation
- **common/** - Common validation patterns
- **courses/** - Course validation
- **faq/** - FAQ validation
- **lessons/** - Lesson validation
- **roadmap/** - Roadmap validation
- **students/** - Student validation
- **topics/** - Topic validation

## Constants:
- **courses/** - Course-specific constants

## Standards:
- **TypeScript**: Full type safety implementation
- **Zod**: Schema validation for runtime type checking
- **Domain Organization**: Types organized by business domain
- **Consistency**: Consistent naming and structure patterns
- **Reusability**: Shared types prevent duplication across domains 