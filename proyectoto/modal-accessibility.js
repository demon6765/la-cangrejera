/**
 * Modal Accessibility Management
 * Simple focus management for Bootstrap modals - NO ARIA ATTRIBUTES
 */

class ModalAccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        // Listen for modal events
        document.addEventListener('DOMContentLoaded', () => {
            this.setupModalListeners();
        });
    }

    setupModalListeners() {
        // Get all modals
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            // Remove existing listeners to prevent duplicates
            modal.removeEventListener('show.bs.modal', this.handleModalShow);
            modal.removeEventListener('shown.bs.modal', this.handleModalShown);
            modal.removeEventListener('hide.bs.modal', this.handleModalHide);
            modal.removeEventListener('hidden.bs.modal', this.handleModalHidden);
            
            // Add new listeners
            modal.addEventListener('show.bs.modal', this.handleModalShow.bind(this));
            modal.addEventListener('shown.bs.modal', this.handleModalShown.bind(this));
            modal.addEventListener('hide.bs.modal', this.handleModalHide.bind(this));
            modal.addEventListener('hidden.bs.modal', this.handleModalHidden.bind(this));
        });
    }

    handleModalShow(event) {
        const modal = event.target;
        
        // Remove any aria-hidden attributes that Bootstrap might add
        if (modal.hasAttribute('aria-hidden')) {
            modal.removeAttribute('aria-hidden');
        }
        
        // Remove role attribute if present
        if (modal.hasAttribute('role')) {
            modal.removeAttribute('role');
        }
    }

    handleModalShown(event) {
        const modal = event.target;
        
        // Find the first focusable element in the modal
        const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            // Focus the first focusable element
            setTimeout(() => {
                try {
                    focusableElements[0].focus();
                } catch (error) {
                    console.warn('Could not focus first element in modal:', error);
                }
            }, 50);
        }
        
        // Trap focus within the modal
        this.trapFocus(modal);
    }

    handleModalHide(event) {
        const modal = event.target;
        
        // Remove focus trap
        this.removeFocusTrap(modal);
    }

    handleModalHidden(event) {
        const modal = event.target;
        
        // Ensure aria-hidden is removed when modal is hidden
        if (modal.hasAttribute('aria-hidden')) {
            modal.removeAttribute('aria-hidden');
        }
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Handle Tab key
        const handleTabKey = (event) => {
            if (event.key === 'Tab') {
                try {
                    if (event.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstElement) {
                            event.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastElement) {
                            event.preventDefault();
                            firstElement.focus();
                        }
                    }
                } catch (error) {
                    console.warn('Error in focus trap:', error);
                }
            }
        };
        
        // Handle Escape key
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                try {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) {
                        modalInstance.hide();
                    }
                } catch (error) {
                    console.warn('Error closing modal with Escape:', error);
                }
            }
        };
        
        // Add event listeners
        modal.addEventListener('keydown', handleTabKey);
        modal.addEventListener('keydown', handleEscapeKey);
        
        // Store the handlers for later removal
        modal._focusHandlers = { handleTabKey, handleEscapeKey };
    }

    removeFocusTrap(modal) {
        if (modal._focusHandlers) {
            modal.removeEventListener('keydown', modal._focusHandlers.handleTabKey);
            modal.removeEventListener('keydown', modal._focusHandlers.handleEscapeKey);
            delete modal._focusHandlers;
        }
    }

    destroy() {
        // Cleanup if needed
    }
}

// Initialize the modal accessibility manager
const modalAccessibility = new ModalAccessibilityManager();

// Export for use in other scripts
window.ModalAccessibilityManager = ModalAccessibilityManager;
window.modalAccessibility = modalAccessibility;