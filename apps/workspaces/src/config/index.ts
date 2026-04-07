// Export all configuration types
export type {
  IndustryConfig,
  IndustryTerminology,
  IndustryTheme,
  IndustryRouteConfig,
  WorkbenchSlotConfig,
} from './types';

// Export industry registry utilities
export {
  industryRegistry,
  getAvailableIndustries,
  isValidIndustry,
  type IndustryId,
} from './industries/registry';

// Export loader utilities
export {
  loadIndustryConfig,
  loadDefaultConfig,
  getIndustryId,
  preloadAllIndustries,
} from './loader';