import { useEffect, useState } from 'react';

/**
 * A hook that provides keyboard visibility state and automatically scrolls
 * focused inputs into view.
 *
 * @returns { isKeyboardOpen: boolean }
 */
export function useKeyboardAvoidance() {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    useEffect(() => {
        // Store the initial height to compare against
        const initialHeight = window.innerHeight;

        const handleResize = () => {
            const currentHeight = window.innerHeight;
            // If the height shrinks by more than 150px (approx keyboard height), assume open
            // Note: This relies on interactive-widget=resizes-content
            const diff = initialHeight - currentHeight;
            setIsKeyboardOpen(diff > 150);
        };

        const handleFocus = (e: FocusEvent) => {
             const target = e.target as HTMLElement;
             // Check if the target is an input or textarea
             if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                 // Wait a moment for the keyboard animation to start/finish
                 // iOS and Android keyboard animations vary, 300ms is a safe bet
                 setTimeout(() => {
                     // 'scrollIntoView' with block: 'center' attempts to put the element
                     // in the middle of the visible area.
                     target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                 }, 300);
             }
        };

        window.addEventListener('resize', handleResize);
        // Use capture phase for focus to ensure we catch it early
        window.addEventListener('focusin', handleFocus, true);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('focusin', handleFocus, true);
        };
    }, []);

    return { isKeyboardOpen };
}
