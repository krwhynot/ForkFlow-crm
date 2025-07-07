# ADR-001: Circular Dependency Resolution Strategy

## Status
Accepted

## Context
The ForkFlow CRM codebase had a critical circular dependency between `authProvider.ts` and `dataProvider.ts` in the fakerest provider implementation. This circular import created tight coupling between authentication and data access layers, with potential for deadlocks, initialization order issues, and testing complications.

**Specific Issue:**
- `authProvider.ts` line 23 imported `dataProvider` for user validation
- `dataProvider.ts` line 30 imported `authProvider` for authentication context
- This created a circular import: `authProvider` → `dataProvider` → `authProvider`

## Decision
Implement a shared `UserService` module to break the circular dependency by:

1. Creating `src/providers/commons/userService.ts` with a `UserService` class
2. The `UserService` takes `dataProvider` as a constructor argument 
3. Moving user validation logic from `authProvider` to `UserService`
4. `authProvider` instantiates `UserService` with `dataProvider` instead of directly importing it

## Rationale
This approach maintains clear separation of concerns while eliminating the circular import:

- **Single Responsibility**: `UserService` handles user data operations
- **Dependency Injection**: `UserService` receives `dataProvider` as a dependency
- **Testability**: `UserService` can be easily mocked and tested
- **Maintainability**: Clear data flow without circular references

## Consequences

### Positive
- ✅ Eliminates circular dependency
- ✅ Improves testability of authentication logic
- ✅ Maintains separation of concerns
- ✅ Enables better error handling and validation
- ✅ Provides a clear pattern for future similar issues

### Negative
- ➖ Adds one additional abstraction layer
- ➖ Slightly more complex initialization process

## Alternatives Considered

1. **Event-driven architecture**: Using events to decouple auth and data providers
   - Rejected: Overly complex for this specific issue
   
2. **Dependency injection container**: Using a DI framework
   - Rejected: Too heavy-weight for the current codebase
   
3. **Moving user validation to a higher level**: Handling auth in the CRM component
   - Rejected: Would break the provider abstraction pattern

4. **Combining auth and data providers**: Merging into a single provider
   - Rejected: Violates single responsibility principle

## Implementation Details

### Before (Circular Dependency)
```typescript
// authProvider.ts
import { dataProvider } from './dataProvider';
const user = await dataProvider.getList('sales', {...});

// dataProvider.ts  
import { authProvider } from './authProvider';
```

### After (UserService Pattern)
```typescript
// userService.ts
export class UserService {
    constructor(private dataProvider: DataProvider) {}
    
    async getUser(email: string): Promise<Sale> {
        const sales = await this.dataProvider.getList('sales', {...});
        return sales.data.find(sale => sale.email === email);
    }
}

// authProvider.ts
const userService = new UserService(dataProvider);
const user = await userService.getUser(email);
```

## Verification
- ✅ Automated circular dependency detection added to CI/CD: `npm run deps:circular`
- ✅ All existing tests continue to pass
- ✅ No breaking changes to the public API
- ✅ Build process completes without circular dependency warnings