/**
 * Bootstrap Modal Accessibility Fix
 * Removes aria-hidden attributes and prevents focus conflicts
 */

(function() {
    'use strict';

    // Wait for Bootstrap to load
    function waitForBootstrap() {
        if (window.bootstrap && window.bootstrap.Modal) {
            applyFix();
        } else {
            setTimeout(waitForBootstrap, 100);
        }
    }

    function applyFix() {
        // Override the Modal constructor
        const OriginalModal = window.bootstrap.Modal;
        
        function FixedModal(element, options) {
            const modal = new OriginalModal(element, options);
            
            // Override show method to remove focus from triggering element and aria-hidden
            const originalShow = modal.show;
            modal.show = function() {
                // Remove focus from the currently focused element before showing modal
                const activeElement = document.activeElement;
                if (activeElement && 
                    activeElement !== document.body && 
                    activeElement !== document.documentElement &&
                    typeof activeElement.blur === 'function') {
                    activeElement.blur();
                }
                
                // Remove aria-hidden from the modal element
                if (element.hasAttribute('aria-hidden')) {
                    element.removeAttribute('aria-hidden');
                }
                
                return originalShow.call(this);
            };
            
            // Override hide method to remove aria-hidden
            const originalHide = modal.hide;
            modal.hide = function() {
                // Remove aria-hidden when hiding
                if (element.hasAttribute('aria-hidden')) {
                    element.removeAttribute('aria-hidden');
                }
                
                return originalHide.call(this);
            };
            
            return modal;
        }

        // Copy static methods
        Object.setPrototypeOf(FixedModal, OriginalModal);
        Object.assign(FixedModal, OriginalModal);

        // Replace the original Modal
        window.bootstrap.Modal = FixedModal;
        
        console.log('✅ Bootstrap Modal Focus Fix applied');
    }

    // Also fix data-bs-toggle="modal" buttons
    function fixModalTriggers() {
        document.addEventListener('click', function(event) {
            const target = event.target;
            if (target && target.hasAttribute && target.hasAttribute('data-bs-toggle')) {
                const toggleValue = target.getAttribute('data-bs-toggle');
                if (toggleValue === 'modal') {
                    // Remove focus from the triggering button before modal opens
                    setTimeout(() => {
                        if (target.blur && typeof target.blur === 'function') {
                            target.blur();
                        }
                    }, 0);
                }
            }
        });
    }

    // Monitor for aria-hidden attributes and remove them
    function monitorAriaHidden() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
                    const target = mutation.target;
                    if (target.classList.contains('modal') && target.hasAttribute('aria-hidden')) {
                        target.removeAttribute('aria-hidden');
                        console.log('Removed aria-hidden from modal:', target.id);
                    }
                }
            });
        });
        
        // Observe all modals
        document.querySelectorAll('.modal').forEach(modal => {
            observer.observe(modal, { attributes: true, attributeFilter: ['aria-hidden'] });
        });
        
        // Also observe for new modals
        const modalObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('modal')) {
                        observer.observe(node, { attributes: true, attributeFilter: ['aria-hidden'] });
                    }
                });
            });
        });
        
        modalObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Start the fix process
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForBootstrap();
            fixModalTriggers();
            monitorAriaHidden();
        });
    } else {
        waitForBootstrap();
        fixModalTriggers();
        monitorAriaHidden();
    }

})();