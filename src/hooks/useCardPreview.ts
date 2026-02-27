// @ts-nocheck
/**
 * useCardPreview Hook
 *
 * Handles the enlarged card preview.
 * Desktop: shows on hover after 400ms delay.
 * Mobile/small screens: shows on long press (~500ms).
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// === TYPES ===

/** Card-like object with preview-relevant properties */
interface PreviewCard {
  isLeader?: boolean;
  isBase?: boolean;
  backImageUrl?: string | null;
  imageUrl?: string;
  name?: string;
  [key: string]: unknown;
}

/** Card preview state */
interface CardPreviewState {
  card: PreviewCard;
  x: number;
  y: number;
  isMobile: boolean;
}

/** Event with currentTarget that has getBoundingClientRect */
interface PreviewEvent {
  currentTarget: {
    getBoundingClientRect: () => DOMRect;
  };
}

/** Return type for useCardPreview hook */
export interface UseCardPreviewReturn {
  hoveredCardPreview: CardPreviewState | null;
  handleCardMouseEnter: (card: PreviewCard, event: PreviewEvent | null) => void;
  handleCardMouseLeave: () => void;
  handlePreviewMouseEnter: () => void;
  handlePreviewMouseLeave: () => void;
  handleCardTouchStart: (card: PreviewCard) => void;
  handleCardTouchEnd: () => void;
  dismissPreview: () => void;
}

// === HELPERS ===

function isSmallViewport(): boolean {
  return window.innerHeight <= 500 || window.innerWidth <= 768;
}

/**
 * Detect if device is a tablet (iPad-like):
 * - Has touch capability
 * - Larger screen (not a phone)
 */
function isTablet(): boolean {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isLargeScreen = window.innerWidth >= 768 && window.innerHeight >= 500;
  return hasTouch && isLargeScreen;
}

// === HOOK ===

export function useCardPreview(): UseCardPreviewReturn {
  const [hoveredCardPreview, setHoveredCardPreview] = useState<CardPreviewState | null>(null);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef<boolean>(false);

  // Clear preview on visibility change (tab switch) or scroll
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setHoveredCardPreview(null);
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current);
          previewTimeoutRef.current = null;
        }
      }
    };

    const handleScroll = () => {
      setHoveredCardPreview(null);
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
        previewTimeoutRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // === DESKTOP: hover ===

  const handleCardMouseEnter = useCallback((card: PreviewCard, event: PreviewEvent | null) => {
    if (!event) return;

    // On small viewports, don't show on hover — use long press instead
    if (isSmallViewport()) return;

    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current);
      previewHideTimeoutRef.current = null;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    previewTimeoutRef.current = setTimeout(() => {
      let previewX = rect.right + 20;

      const isHorizontal = card.isLeader || card.isBase;
      const hasBackImage = card.backImageUrl && card.isLeader;
      let previewWidth: number;
      let previewHeight: number;

      if (hasBackImage) {
        previewWidth = 504 + 360 + 20;
        previewHeight = 504;
      } else {
        previewWidth = isHorizontal ? 504 : 360;
        previewHeight = isHorizontal ? 360 : 504;
      }

      if (previewX + previewWidth > window.innerWidth) {
        previewX = rect.left - previewWidth - 20;
        if (previewX < 0) previewX = 10;
      }
      if (previewX < 0) previewX = 10;

      let adjustedY = rect.top + rect.height / 2;
      if (adjustedY - previewHeight / 2 < 10) adjustedY = previewHeight / 2 + 10;
      if (adjustedY + previewHeight / 2 > window.innerHeight - 10) adjustedY = window.innerHeight - previewHeight / 2 - 10;

      setHoveredCardPreview({ card, x: previewX, y: adjustedY, isMobile: false });
    }, 400);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
    setHoveredCardPreview(null);
  }, []);

  const handlePreviewMouseEnter = useCallback(() => {
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current);
      previewHideTimeoutRef.current = null;
    }
  }, []);

  const handlePreviewMouseLeave = useCallback(() => {
    if (previewHideTimeoutRef.current) {
      clearTimeout(previewHideTimeoutRef.current);
      previewHideTimeoutRef.current = null;
    }
    setHoveredCardPreview(null);
  }, []);

  // === MOBILE/TABLET: touch handling ===
  // - Tablets (iPad): single tap to show/dismiss preview
  // - Phones: long press (500ms) to show preview

  const handleCardTouchStart = useCallback((card: PreviewCard) => {
    longPressTriggeredRef.current = false;
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    // On tablets (iPad), use tap instead of long press
    if (isTablet()) {
      // If preview is already showing this card, do nothing (let touchEnd dismiss it)
      // If showing different card or no preview, show this card
      longPressTriggeredRef.current = true;
      setHoveredCardPreview({
        card,
        x: 0,
        y: 0,
        isMobile: true, // Use mobile/centered layout on tablets too
      });
      return;
    }

    // On phones, use long press
    longPressTimeoutRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      // Center the preview on screen — CardPreview handles mobile sizing
      setHoveredCardPreview({
        card,
        x: 0,
        y: 0,
        isMobile: true,
      });
    }, 500);
  }, []);

  const handleCardTouchEnd = useCallback((e?: { preventDefault?: () => void }) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    // If long press or tablet tap fired, prevent the synthetic click event
    if (longPressTriggeredRef.current) {
      e?.preventDefault?.();
      longPressTriggeredRef.current = false;
    }
  }, []);

  const dismissPreview = useCallback(() => {
    setHoveredCardPreview(null);
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  return {
    hoveredCardPreview,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePreviewMouseEnter,
    handlePreviewMouseLeave,
    handleCardTouchStart,
    handleCardTouchEnd,
    dismissPreview,
  };
}

export default useCardPreview;
