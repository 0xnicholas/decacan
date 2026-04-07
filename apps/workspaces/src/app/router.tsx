import { IndustryAwareRouter } from '../core/router/IndustryAwareRouter';

// Export the industry-aware router as the main router
export function AppRouter() {
  return <IndustryAwareRouter />;
}

// Also export for backward compatibility
export { IndustryAwareRouter };
