# Implementation Plan: Help Contact Form Modal

## Overview

This plan implements a contact form modal in the Help page that allows users to submit support requests. The implementation adds state management, modal UI components, form validation, and submission handling to the existing Help.jsx component using React hooks and inline styling consistent with the application's design system.

## Tasks

- [x] 1. Add state management and modal structure to Help.jsx
  - Add useState hooks for modal visibility (isModalOpen), form data (formData), validation errors (errors), submission state (isSubmitting), and success state (showSuccess)
  - Initialize formData state with name, email, category, and message fields
  - Add modal backdrop and modal container elements with conditional rendering based on isModalOpen
  - Add modal header with title "Contact Support" and close button
  - _Requirements: 1.2, 1.3, 6.4_

- [x] 2. Implement form fields and structure
  - [x] 2.1 Create form element with input fields
    - Add Name input field with label and error display
    - Add Email input field with label and error display
    - Add Issue Category dropdown with four options: Technical Issue, Billing Question, Feature Request, General Inquiry
    - Add Message textarea with label and error display
    - Add helper text "We typically respond within 24 hours"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.3_

  - [x] 2.2 Add form action buttons
    - Add Cancel button that closes the modal
    - Add Submit button styled with brand color #ff8d2f
    - Disable Submit button when isSubmitting is true
    - _Requirements: 1.5, 5.3_

- [x] 3. Implement form validation logic
  - [x] 3.1 Create validation function
    - Write validateForm function that checks all required fields
    - Validate Name field is not empty
    - Validate Email field is not empty and matches email format regex
    - Validate Message field is not empty
    - Return errors object with field-specific error messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.2 Write unit tests for validation function
    - Test empty field validation
    - Test email format validation
    - Test valid form data passes validation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Implement event handlers
  - [x] 4.1 Create modal control handlers
    - Write openModal function that sets isModalOpen to true
    - Write closeModal function that resets all state (isModalOpen, formData, errors, showSuccess)
    - Add onClick handler to Contact_Button to call openModal
    - Add onClick handlers to close button, Cancel button, and backdrop to call closeModal
    - _Requirements: 1.2, 1.4, 1.5, 1.6_

  - [x] 4.2 Create form input handlers
    - Write handleInputChange function to update formData state
    - Clear field-specific error when user types in that field
    - Connect handleInputChange to all form inputs (name, email, category, message)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Create form submission handler
    - Write handleSubmit function that prevents default form submission
    - Call validateForm and set errors state
    - If validation passes, set isSubmitting to true
    - Simulate form submission (console.log form data)
    - Set showSuccess to true after submission
    - Set timeout to close modal after 2 seconds
    - Reset isSubmitting state
    - _Requirements: 3.5, 4.1, 4.2, 4.3_

- [ ] 5. Checkpoint - Ensure basic functionality works
  - Verify modal opens and closes correctly
  - Verify form fields accept input
  - Verify validation prevents submission with invalid data
  - Ensure all tests pass, ask the user if questions arise

- [ ] 6. Implement keyboard interactions and accessibility
  - [x] 6.1 Add Escape key handler
    - Add useEffect hook to listen for keydown events
    - Close modal when Escape key is pressed and modal is open
    - Clean up event listener on unmount
    - _Requirements: 6.2_

  - [x] 6.2 Add focus management
    - Add useEffect hook that runs when modal opens
    - Set focus to Name input field when modal opens
    - _Requirements: 6.1, 6.5_

- [x] 7. Style the modal and form elements
  - [x] 7.1 Add modal styling to global.css
    - Add CSS classes for modal-backdrop and modal (if not already present)
    - Add CSS classes for contact-form-modal styling
    - Add CSS classes for form-group, form-label, form-input, form-select, form-textarea
    - Add CSS classes for form-error styling
    - Style Submit button with brand color #ff8d2f
    - Add CSS for success-message display
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 7.2 Update Contact_Button in help-contact-card
    - Replace static text with a button element
    - Style button to match the card design with brand color accents
    - Add icon and text "Contact Support"
    - _Requirements: 1.1, 5.5_

- [x] 8. Implement success message display
  - Add conditional rendering for Success_Message in modal
  - Display "Thank you! Your message has been sent successfully." when showSuccess is true
  - Hide form fields when showSuccess is true
  - Ensure modal closes automatically 2 seconds after success message appears
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Final checkpoint and integration verification
  - Test complete user flow: open modal, fill form, submit, see success, modal closes
  - Test validation for all error cases
  - Test keyboard interactions (Escape key)
  - Test focus management
  - Verify styling matches brand guidelines
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation uses React hooks (useState, useEffect) for state management
- Form submission currently logs to console; backend integration can be added later
- Modal uses existing CSS classes where possible to maintain consistency
- Focus management and keyboard support ensure accessibility compliance
