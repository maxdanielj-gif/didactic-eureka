import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
interface BrandingBadgeProps {
  // Brand information
  brandName?: string;
  brandLogo?: string;
  brandTextLogo?: string;

  // Badge styling
  variant?: 'default' | 'white' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';

  // Positioning
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  className?: string;

  // Tooltip options
  showTooltip?: boolean;
  tooltipText?: React.ReactNode;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  tooltipDelay?: number;

  // Custom styling
  customColors?: {
    background?: string;
    text?: string;
    border?: string;
  };

  // Click handler
  onClick?: () => void;
}

export const BrandingBadge: React.FC<BrandingBadgeProps> = ({
  brandTextLogo='/assets/brand-text-logo.svg',
  variant = 'default',
  size = 'md',
  position = 'bottom-right',
  className = '',
  showTooltip = true,
  tooltipText = <div><p>This badge will be visible when you publish this site</p><p>Upgrade to the <a className='text-blue-500' href="https://lastapp.ai/" target="_blank" rel="noopener noreferrer">Pro Plan</a> to remove it.</p></div>,
  tooltipDelay = 300,
  customColors,
  onClick
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const [isEmbedded, setIsEmbedded] = useState(false);
  // Check for embed query parameter and persist to sessionStorage
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const embed = urlParams.get('embed');

      if (embed === 'true') {
        // Set to true and store in sessionStorage
        setIsEmbedded(true);
        sessionStorage.setItem('isEmbedded', 'true');
      } else if (embed === 'false') {
        // Set to false and remove from sessionStorage
        setIsEmbedded(false);
        sessionStorage.removeItem('isEmbedded');
      } else {
        // No URL param, check sessionStorage for existing value
        const storedEmbed = sessionStorage.getItem('isEmbedded');
        if (storedEmbed === 'true') {
          setIsEmbedded(true);
        } else {
          setIsEmbedded(false);
        }
      }
    } catch (error) {
      // Fallback if sessionStorage is not available
      console.warn('SessionStorage not available, falling back to default embed state:', error);
      setIsEmbedded(false);
    }
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);



  // Get position styles
  const getPositionStyles = () => {
    const baseStyles = 'fixed z-50';

    switch (position) {
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'center':
        return `${baseStyles} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      default:
        return `${baseStyles} bottom-4 right-4`;
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'; // 12px font size
      case 'md':
        return 'px-2 py-1.5 text-sm'; // 14px font size
      case 'lg':
        return 'px-3 py-2 text-base'; // 16px font size
      default:
        return 'px-3 py-2.5 text-sm'; // default to 14px
    }
  };

  // Get variant styles
  const getVariantStyles = () => {
    if (customColors) {
      return `bg-${customColors.background || 'white'} text-${customColors.text || 'gray-900'} border-${customColors.border || 'gray-200'}`;
    }

    switch (variant) {
      case 'white':
        return 'bg-white text-gray-900 border-gray-200 shadow-lg';
      case 'dark':
        return 'bg-gray-900 text-white border-gray-700 shadow-lg';
      case 'outline':
        return 'bg-transparent text-gray-700 border-2 border-gray-300';
      default:
        return 'bg-white text-gray-900 border border-gray-200 shadow-md';
    }
  };

  // Get tooltip variant styles
  const getTooltipVariantStyles = () => {
    if (customColors) {
      return {
        tooltip: `bg-${customColors.background || 'white'} text-${customColors.text || 'gray-900'} border-${customColors.border || 'gray-200'}`,
        arrow: `bg-${customColors.background || 'white'} border-${customColors.border || 'gray-200'}`
      };
    }

    switch (variant) {
      case 'white':
        return {
          tooltip: 'bg-white text-gray-900 border-gray-200',
          arrow: 'bg-white border-gray-200'
        };
      case 'dark':
        return {
          tooltip: 'bg-gray-900 text-white border-gray-700',
          arrow: 'bg-gray-900 border-gray-700'
        };
      case 'outline':
        return {
          tooltip: 'bg-white text-gray-700 border-gray-300',
          arrow: 'bg-white border-gray-300'
        };
      default:
        return {
          tooltip: 'bg-gray-100 text-gray-900 border-gray-200',
          arrow: 'bg-gray-100 border-gray-200'
        };
    }
  };

  // Get tooltip text size based on badge size
  const getTooltipTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'; // 12px font size for small tooltip
      case 'md':
        return 'text-sm'; // 14px font size for medium tooltip
      case 'lg':
        return 'text-base'; // 16px font size for large tooltip
      default:
        return 'text-sm'; // default to 14px
    }
  };

  // Get logo size for images
  const getLogoSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4'; // 16x16px for small
      case 'md':
        return 'w-6 h-6'; // 24x24px for medium
      case 'lg':
        return 'w-8 h-8'; // 32x32px for large
      default:
        return 'w-6 h-6'; // default to medium
    }
  };

  // Get text logo size (usually wider than icon logo)
  const getTextLogoSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-auto'; // height 12px, auto width, max 64px wide
      case 'md':
        return 'h-6 w-auto'; // height 16px, auto width, max 80px wide
      case 'lg':
        return 'h-8 w-auto'; // height 20px, auto width, max 96px wide
      default:
        return 'h-6 w-auto'; // default to medium
    }
  };

  // Get tooltip positioning based on badge size
  const getTooltipPosition = () => {
    // Use inline styles for precise positioning since some Tailwind classes might not exist
    const offsets = {
      sm: { vertical: 48, horizontal: 16 }, // 12 * 4px = 48px
      md: { vertical: 64, horizontal: 16 }, // 16 * 4px = 64px
      lg: { vertical: 80, horizontal: 16 }  // 20 * 4px = 80px
    };

    const offset = offsets[size] || offsets.md;

    const styles: React.CSSProperties = {};

    if (position.includes('bottom')) {
      styles.bottom = `${offset.vertical}px`;
    } else {
      styles.top = `${offset.vertical}px`;
    }

    if (position.includes('right')) {
      styles.right = `${offset.horizontal}px`;
    } else {
      styles.left = `${offset.horizontal}px`;
    }

    return styles;
  };

  const handleMouseEnter = () => {
    if (showTooltip) {
      // Clear any existing hide timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      setIsTooltipVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (showTooltip) {
      // Set a delay before hiding the tooltip
      hideTimeoutRef.current = setTimeout(() => {
        setIsTooltipVisible(false);
      }, tooltipDelay);
    }
  };

  const handleTooltipMouseEnter = () => {
    // Clear the hide timeout when hovering over the tooltip
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    // Hide the tooltip when leaving it
    setIsTooltipVisible(false);
  };

  // Don't render if embedded - moved after all hooks
  if (isEmbedded) {
    return null;
  }
  return (
    <>
      {/* Main Badge */}
      <div
        className={`
          ${getPositionStyles()}
          ${getSizeStyles()}
          ${getVariantStyles()}
          rounded-lg font-medium cursor-pointer transition-all duration-200
          hover:shadow-lg hover:scale-105 active:scale-95
          hidden 
          md:block
          ${className}
        ` }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        role="button"
        tabIndex={onClick ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        <div className="flex items-center space-x-2">
          {/* Brand Logos */}
          {brandTextLogo && (
            <div className="flex items-center space-x-1">
              {brandTextLogo && (
                <img
                  src={brandTextLogo}
                  alt={`lastapp text logo`}
                  className={`${getTextLogoSize()} object-contain`}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {isTooltipVisible && showTooltip && (
        <div
          className={`
            fixed z-50 px-4 py-3 rounded-lg shadow-xl
            max-w-xs leading-relaxed cursor-default
            hidden 
            md:block
            ${getTooltipVariantStyles().tooltip}
            ${getTooltipTextSize()}
          `}
          style={getTooltipPosition()}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="mb-2">{tooltipText}</div>

          {/* Tooltip Arrow */}
          <div
            className={`absolute w-3 h-3 border-l border-t transform rotate-45 ${
              getTooltipVariantStyles().arrow
            } ${
              position.includes('bottom')
                ? `top-full ${position.includes('left') ? 'left-1/4' : 'left-3/4'} -translate-x-1/2 -translate-y-1/2`
                : `bottom-full ${position.includes('left') ? 'left-1/4' : 'left-3/4'} -translate-x-1/2 translate-y-1/2`
            }`}
          />
        </div>
      )}
    </>
  );
};

// Export default for easy importing
export default BrandingBadge;
