# Authentication E2E Test Suite

This directory contains advanced Playwright end-to-end (E2E) tests for authentication flows in your React Admin CRM application. These tests ensure your sign-in and sign-up pages are robust, secure, accessible, and user-friendly.

---

## Test Files and Coverage

### **signin.spec.ts**
Covers the sign-in (login) page, including:

- **Happy Path:**
  - User can log in with valid credentials and is redirected to the dashboard.
- **Invalid Credentials:**
  - Shows a generic error for wrong password or non-existent account.
- **UI Behaviors:**
  - Submit button is disabled until required fields are filled.
  - Pressing Enter submits the form.
  - Password visibility toggle works.
- **Accessibility:**
  - Automated axe-core accessibility check.
  - Full keyboard navigation (Tab through fields and submit).
  - ARIA attributes for screen readers (e.g., aria-label, aria-live).
- **Security:**
  - Session cookie is set with Secure and HttpOnly flags after login.
  - Account lockout after multiple failed attempts.
  - SQL injection and XSS input is sanitized and rejected.
- **Password Reset:**
  - User can request a password reset and sees a confirmation message.
- **MFA (Multi-Factor Authentication):**
  - User is prompted for an MFA code if required, and can complete login with a valid code.

### **signup.spec.ts**
Covers the sign-up (registration) page, including:

- **Required Fields:**
  - All mandatory fields are validated (first name, email, password, confirm password).
- **Password Rules:**
  - Enforces password length, complexity, and matching.
- **Duplicate Email:**
  - Shows an error if the email is already registered.
- **SQLi/XSS Input:**
  - Sanitizes and rejects malicious input.
- **Keyboard Navigation:**
  - All fields and submit button are reachable and operable via keyboard.
- **ARIA/Screen Reader:**
  - Proper ARIA attributes and error message announcements.
- **Email Verification:**
  - Shows activation message after successful sign-up.
- **Password Reset:**
  - User can request a password reset from the sign-up page.
- **MFA Challenge:**
  - User is prompted for an MFA code after sign-up if required.
- **Accessibility:**
  - Automated axe-core accessibility check.

---

## How to Run

- **Sign-In Tests Only:**
  ```sh
  npm run test:e2e:auth:signin
  ```
- **Sign-Up Tests Only:**
  ```sh
  npm run test:e2e:auth:signup
  ```

---

## Extending This Suite
- Add new flows (password change, account recovery, etc.) using the same patterns.
- Use `AuthHelpers` for robust, maintainable test code.
- Ensure all new tests include accessibility and security checks.

---

## Accessibility & Security
- All tests include automated accessibility checks (axe-core).
- Security scenarios (lockout, input sanitization, cookie flags) are covered.

---

For questions or to expand this suite, see the Playwright and axe-core documentation, or contact the project maintainers. 