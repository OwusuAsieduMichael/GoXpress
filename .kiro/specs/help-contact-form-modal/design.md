# Design Document: Help Contact Form Modal

## Overview

This design implements a contact form modal component integrated into the existing Help page. The solution adds an interactive button to the help-contact-card section that opens a modal dialog containing a form for submitting support requests. The implementation uses React hooks for state management, leverages existing modal CSS classes for consistent styling, and provides comprehensive form validation with user feedback.

The design follows a component-based architecture where the modal is embedded within the Help.jsx component, managing its own state for form data, validation errors, and display states. The modal will use the existing `.modal-backdrop` and `.modal` CSS classes while adding custom styles for form-specific elements.

## Architecture

### Component Structure

The implementation follows a single-component approach where the contact form modal is integrated directly into the Help.jsx component.

### State Management

The component will use React's `useState` hook to manage:

1. Modal Visibility State: Boolean flag controlling modal display
2. Form Data State: Object containing name, email, category, and message fields
3. Validation Errors State: Object containing error messages for each field
4. Submission State: Boolean flag indicating form submission status
5. Success State: Boolean flag for displaying success message

### Event Flow

1. Opening Modal: User clicks Contact Button, modal renders with focus on first field
2. Form Input: User types, updates formData, clears corresponding error if exists
3. Form Submission: User clicks Submit, validates, if valid shows success message, closes modal after 2s, resets form
4. Closing Modal: User clicks close/cancel/backdrop/ESC, resets form and errors, closes modal

## Components and Interfaces

### ContactFormModal Component (Inline)

The modal will be implemented as JSX within the Help component, conditionally rendered based on isModalOpen state.

Props: None (uses parent component state)

Rendered Elements:
- Modal backdrop with click handler
- Modal container with form
- Close button in header
- Form fields with labels and error messages
- Action buttons (Cancel, Submit)

### Event Handlers

handleInputChange(e): Updates formData state with new field value, clears error for the modified field

validateForm(): Validates all form fields, returns boolean indicating validity, sets errors state with validation messages

handleSubmit(e): Prevents default form submission, calls validateForm(), if valid sets success state, schedules modal close, resets form

closeModal(): Resets all form state, closes modal

handleBackdropClick(e): Closes modal only if backdrop itself is clicked (not modal content)

## Data Models

### FormData Interface

name: string (User's full name)
email: string (User's email address)
category: string (Selected issue category)
message: string (Support request message)

### ValidationErrors Interface

name?: string (Error message for name field)
email?: string (Error message for email field)
category?: string (Error message for category field)
message?: string (Error message for message field)

### Category Options

- Select an issue type (empty value)
- Technical Issue
- Billing Question
- Feature Request
- General Inquiry

## Validation Logic

### Field Validation Rules

Name Field:
- Required: Must not be empty
- Trimmed before validation
- Error message: "Name is required"

Email Field:
- Required: Must not be empty
- Format: Must match email pattern
- Error messages: "Email is required" or "Please enter a valid email address"

Category Field:
- Required: Must have a selected value (not empty string)
- Error message: "Please select an issue category"

Message Field:
- Required: Must not be empty
- Trimmed before validation
- Error message: "Message is required"



## Styling Specifications

### Existing Classes to Reuse

- modal-backdrop: Fixed overlay with semi-transparent background
- modal: Modal container with border, shadow, and rounded corners
- modal-header: Header section with bottom border
- modal-body: Content area with padding

### New CSS Classes

Contact form modal will have custom styles for form fields, buttons, error messages, and success messages. The contact button will use the brand color #ff8d2f.

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Modal Opens on Button Click

For any initial modal state (closed), when the contact button is clicked, the modal state should transition to open and the modal should be visible in the DOM.

Validates: Requirements 1.2

### Property 2: Close Actions Close Modal

For any open modal state, when any close action is triggered (close button click, cancel button click, or backdrop click), the modal state should transition to closed and the modal should be removed from the DOM.

Validates: Requirements 1.4, 1.5, 1.6

### Property 3: Escape Key Closes Modal

For any open modal state, when the Escape key is pressed, the modal state should transition to closed and the modal should be removed from the DOM.

Validates: Requirements 6.2

### Property 4: Focus Set on Modal Open

For any modal state transition from closed to open, the first form field (name input) should receive focus automatically.

Validates: Requirements 6.1

### Property 5: Invalid Email Format Rejected

For any string that does not match valid email format (missing @, missing domain, invalid characters), when submitted as the email field value, the form validator should reject the submission and display an error message indicating invalid email format.

Validates: Requirements 3.3

### Property 6: Valid Form Data Passes Validation

For any form data where name is non-empty, email matches valid format, category is selected, and message is non-empty, the form validator should allow submission without displaying error messages.

Validates: Requirements 3.5

### Property 7: Success Message Displayed on Valid Submission

For any valid form data, when the form is submitted successfully, a success message should be displayed in the modal before it closes.

Validates: Requirements 4.1

### Property 8: Form Reset After Submission

For any form data state, after successful submission and modal close, all form fields should be reset to their initial empty values.

Validates: Requirements 4.3

## Error Handling

### Validation Errors

Display Strategy:
- Errors are displayed inline below each form field
- Error messages appear in red text
- Form fields with errors receive a red border
- Multiple errors can be displayed simultaneously

Error Clearing:
- Errors are cleared when the user begins typing in the corresponding field
- All errors are cleared when the modal is closed
- Errors are re-validated on each submission attempt

### User Input Errors

Empty Required Fields: Error messages indicate which fields are required
Invalid Email Format: Error message indicates email format is invalid
No Category Selected: Error message indicates category selection is required

### Edge Cases

Rapid Modal Open/Close: State changes are handled synchronously
Form Submission During Close: Submit button is disabled during submission
Keyboard Navigation: Tab order follows DOM order, Escape key works at any point

## Testing Strategy

### Dual Testing Approach

This feature will be tested using both unit tests and property-based tests to ensure comprehensive coverage.

Unit Tests will focus on:
- Specific examples of modal rendering with correct structure
- Edge cases like empty field validation
- Integration between modal state and Help page component
- Specific user interactions
- Success message display and timing
- CSS class application and styling

Property-Based Tests will focus on:
- Universal properties that hold across all inputs
- Form validation behavior with randomly generated data
- Modal state transitions with various interaction sequences
- Form reset behavior after different submission scenarios

### Property-Based Testing Configuration

Library: @fast-check/vitest for property-based testing in this React/Vitest project

Configuration:
- Each property test will run a minimum of 100 iterations
- Tests will use custom generators for form data, email addresses, and user interactions
- Each test will be tagged with a comment referencing the design document property

Test Tag Format: Feature: help-contact-form-modal, Property N: Property Title

### Property Test Implementation Guidelines

Each correctness property listed above must be implemented as a single property-based test.

### Unit Test Coverage

Unit tests should cover:
- Modal renders with all required form fields (Requirements 2.1-2.6)
- Contact button exists in help-contact-card (Requirement 1.1)
- Modal backdrop prevents interaction (Requirement 1.3)
- Correct CSS classes applied (Requirements 5.1-5.5)
- Labels and accessibility features present (Requirements 6.3-6.5)
- Success message closes modal within 2 seconds (Requirement 4.2)
- Empty field edge cases (Requirements 3.1, 3.2, 3.4)

## Implementation Notes

### File Modifications

frontend/src/pages/Help.jsx:
- Add state management hooks for modal and form
- Add event handler functions
- Add ContactFormModal JSX component
- Modify help-contact-card to include contact button
- Add keyboard event listener for Escape key

frontend/src/styles/global.css:
- Add contact form modal specific styles
- Add form field styles with error states
- Add button styles for contact button
- Add success message styles

### Integration Points

Existing Help Page: Modal integrates seamlessly with existing layout
Existing Modal System: Reuses modal-backdrop and modal classes

### Future Enhancements

Potential improvements for future iterations:
- Backend API integration for actual form submission
- Email validation with DNS lookup
- File attachment support
- Real-time character count for message field
- Form auto-save to localStorage
- Multi-step form for complex issues
- Integration with support ticket system

