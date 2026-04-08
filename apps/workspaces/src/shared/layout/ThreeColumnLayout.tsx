import type { ReactNode } from 'react';

interface ThreeColumnLayoutProps {
  /**
   * Main content area (left column) - flexible width
   */
  main: ReactNode;
  
  /**
   * Info panel (middle column) - fixed 240px
   */
  info: ReactNode;
  
  /**
   * AI Assistant panel (right column) - fixed 320px
   */
  assistant: ReactNode;
  
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Three-column layout for workspace pages
 * 
 * Layout structure:
 * ┌──────────────────┬──────────────┬──────────────────┐
 * │                  │              │                   │
 * │   Main Content   │  Info Panel  │   AI Assistant   │
 * │   (flexible)     │   (240px)   │     (320px)      │
 * │                  │              │                   │
 * └──────────────────┴──────────────┴──────────────────┘
 */
export function ThreeColumnLayout({ main, info, assistant, className = '' }: ThreeColumnLayoutProps) {
  return (
    <div className={`grid h-full gap-6 ${className}`} style={{
      gridTemplateColumns: '1fr 240px 320px',
      minHeight: 0,
    }}>
      {/* Main content area - scrollable */}
      <div className="min-w-0 overflow-auto">
        {main}
      </div>
      
      {/* Info panel - fixed width, scrollable */}
      <div className="min-w-0 overflow-auto">
        {info}
      </div>
      
      {/* AI Assistant - fixed width, always visible */}
      <div className="min-w-0 overflow-auto">
        {assistant}
      </div>
    </div>
  );
}

export default ThreeColumnLayout;
