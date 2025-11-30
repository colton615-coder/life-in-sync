import { useEffect, useState } from 'react';

/**
 * A hook that provides keyboard visibility state and automatically scrolls
 * focused inputs into view.
 *
 * Updated for interactive-widget=overlays-content support.
 *
 * @returns { isKeyboardOpen: boolean }
 */
export function useKeyboardAvoidance() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        // With overlays-content, visualViewport resizes but window.innerHeight stays constant (mostly)
        // or behaves differently depending on browser.
        // We rely on visualViewport for the most accurate measurement.
        if (!window.visualViewport) return;

        const handleResize = () => {
             const vv = window.visualViewport!;
             const layoutHeight = document.documentElement.clientHeight;

             // If visual viewport is significantly smaller than layout height, keyboard is likely open
             const isOpen = vv.height < layoutHeight * 0.85; // Threshold: < 85% of screen height
             setIsKeyboardOpen(isOpen);
        };

        const handleScroll = () => {
             // Optional: Handle manual scroll restoration if needed
        };

        const handleFocus = (e: FocusEvent) => {
             const target = e.target as HTMLElement;
             if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
                 setTimeout(() => {
                     // Check if element is obscured
                     if (window.visualViewport) {
                        const rect = target.getBoundingClientRect();
                        const vv = window.visualViewport;

                        // Calculate visible bottom relative to the layout viewport
                        // visualViewport.offsetTop is the scroll offset of the visual viewport
                        // vv.height is the height of the visual viewport

                        // We simply want to ensure the element is in the visual viewport.
                        // scrollIntoView with block: 'center' usually handles this well even with overlays,
                        // but sometimes we need to be aggressive.

                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                     }
                 }, 300);
             }
        };

        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', handleScroll);
        window.addEventListener('focusin', handleFocus, true);

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.visualViewport?.removeEventListener('scroll', handleScroll);
            window.removeEventListener('focusin', handleFocus, true);
        };
    }, []);

    return { isKeyboardOpen };
}
