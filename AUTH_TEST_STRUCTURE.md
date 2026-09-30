# Krya-Automation Test Structure

## Overview
This is a **Playwright + TypeScript** test automation framework structured around 3 distinct login types with comprehensive positive and negative test cases.

---

## 📁 Folder Structure

```
Krya-Automation/
├── pages/
│   ├── BaseLoginPage.ts          # Base class with shared login functionality
│   ├── KryaLoginPage.ts          # Krya (Internal) login specific POM
│   ├── ClientLoginPage.ts        # Client (Business Partner) login specific POM
│   ├── CandidateLoginPage.ts     # Candidate (External) login specific POM
│   ├── LandingPage.ts            # Landing page with 3 login options
│   ├── DashboardPage.ts          # Dashboard after login
│   └── components/
│       └── Navbar.ts
│
├── fixtures/
│   └── baseTest.ts               # Custom test fixtures with all page objects
│
├── tests/
│   └── auth/
│       ├── krya-login.spec.ts    # 30 Krya login test cases (positive + negative)
│       ├── client-login.spec.ts  # 30 Client login test cases (positive + negative)
│       ├── candidate-login.spec.ts # 20 Candidate login test cases (positive + negative)
│       └── logout.spec.ts
│
├── data/
│   ├── authData.json             # Updated with real credentials
│   └── userData.json
│
├── utils/
│   ├── helpers.ts
│   └── apiHelpers.ts
│
├── config/
│   ├── dev.json
│   ├── qa.json
│   └── prod.json
│
├── playwright.config.ts          # Playwright configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

---

## 🔐 Login Types & Credentials

### 1. **Krya Login** (Internal Users)
- **Username:** `srini`
- **Password:** `Krya@1234`
- **Special Feature:** Requires CAPTCHA
- **Page Object:** `KryaLoginPage`
- **Test File:** `krya-login.spec.ts`
- **Test Cases:** 30 (15 positive, 15 negative)

### 2. **Client Login** (Business Partners)
- **Username:** `jusvin`
- **Password:** `test@1234`
- **Special Feature:** No CAPTCHA required
- **Page Object:** `ClientLoginPage`
- **Test File:** `client-login.spec.ts`
- **Test Cases:** 30 (8 positive, 22 negative)

### 3. **Candidate Login** (External Users)
- **Username:** `candidate_user`
- **Password:** `CandidatePass@123`
- **Special Feature:** No CAPTCHA required
- **Page Object:** `CandidateLoginPage`
- **Test File:** `candidate-login.spec.ts`
- **Test Cases:** 20 (6 positive, 14 negative)

---

## ✅ Positive Test Cases Covered

Each login type includes positive tests for:
- Page loads with all required fields visible
- Page title/heading indicates correct login type
- Successful login with valid credentials
- Input fields accept and retain valid data
- Password field is masked (type="password")
- Forgot Password link is visible
- Login button is functional and enabled
- CAPTCHA presence validation (where applicable)

---

## ❌ Negative Test Cases Covered

Each login type includes negative tests for:
- **Invalid credentials:** Wrong username, wrong password, both invalid
- **Empty fields:** Missing username, missing password, both empty
- **Whitespace:** Leading spaces, trailing spaces, whitespace-only input
- **SQL Injection:** Attempts blocked in both fields
- **XSS Attacks:** Script tags and special characters rejected
- **Case Sensitivity:** Uppercase/lowercase validation
- **Input Limits:** Excessively long inputs (1000+ chars) handled gracefully
- **Special Characters:** Special character encoding validation
- **Repeated Failures:** Error messages consistent across attempts
- **Field Persistence:** Form persists after failed login attempt
- **Password Variations:** Reversed password, special character passwords rejected

---

## 🏗️ Page Object Architecture

### BaseLoginPage
Base class with common methods for all login types:
- `login(username: string, password: string)`
- `verifyErrorVisible()`
- `verifyForgotPasswordLink()`
- `clearFields()`
- `isLoginButtonEnabled()`

### Specific Page Objects
Each extends `BaseLoginPage` with type-specific methods:
- `verifyKryaLoginPageLoaded()` / `verifyClientLoginPageLoaded()` / `verifyCandidateLoginPageLoaded()`
- `verifyPageIndicators()`
- CAPTCHA validation (Krya only)

---

## 🧪 Running Tests

### Run all authentication tests
```bash
npm test -- tests/auth
```

### Run specific login type tests
```bash
npm test -- tests/auth/krya-login.spec.ts
npm test -- tests/auth/client-login.spec.ts
npm test -- tests/auth/candidate-login.spec.ts
```

### Run tests with specific tag
```bash
npm test -- --grep "TC_KRYA_001"
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

### Generate HTML report
```bash
npm test && npm run show:report
```

---

## 📊 Test Coverage Summary

| Feature | Krya | Client | Candidate |
|---------|------|--------|-----------|
| Positive Cases | 15 | 8 | 6 |
| Negative Cases | 15 | 22 | 14 |
| CAPTCHA Required | ✅ Yes | ❌ No | ❌ No |
| Total Cases | **30** | **30** | **20** |

---

## 🔧 Test Data Structure (authData.json)

```json
{
  "kryaLogin": {
    "username": "srini",
    "password": "Krya@1234",
    "role": "internal",
    "requiresCaptcha": true
  },
  "clientLogin": {
    "username": "jusvin",
    "password": "test@1234",
    "role": "client",
    "requiresCaptcha": false
  },
  "candidateLogin": {
    "username": "candidate_user",
    "password": "CandidatePass@123",
    "role": "candidate",
    "requiresCaptcha": false
  },
  "negativeTestCases": {
    "invalidUsername": "invaliduser",
    "invalidPassword": "WrongPassword@123",
    "emptyString": "",
    "sqlInjection": "admin' OR '1'='1",
    "xssAttempt": "<script>alert('xss')</script>"
  }
}
```

---

## 🎯 Test Case Naming Convention

- `TC_KRYA_001` - Krya test case 001
- `TC_CLI_001` - Client test case 001
- `TC_CAND_001` - Candidate test case 001

Each test name clearly indicates:
- Login type (KRYA/CLI/CAND)
- Test sequence number
- Test purpose in description

---

## 🚀 Fixture Usage

All tests use the custom fixture from `fixtures/baseTest.ts`:

```typescript
test('Example', async ({ landingPage, kryaLoginPage }) => {
  await landingPage.goto();
  await landingPage.clickKryaLogin();
  await kryaLoginPage.login('srini', 'Krya@1234');
});
```

---

## 📝 Notes

1. **CAPTCHA Handling:** Krya login tests assume CAPTCHA is either auto-solved or mocked in test environment
2. **Deprecated Files:** Original `LoginPage.ts` and `login.spec.ts` can be deprecated once new structure is fully adopted
3. **Error Message Selectors:** Update `.error`, `.alert-danger` selectors in `BaseLoginPage` based on actual UI
4. **Locator Improvements:** Review and update `@playwright/test` locators if UI structure differs from assumptions

---

## 🔄 Migration Guide (from old structure)

| Old | New |
|-----|-----|
| `LoginPage` | `KryaLoginPage`, `ClientLoginPage`, `CandidateLoginPage` |
| `login.spec.ts` | `krya-login.spec.ts`, `client-login.spec.ts`, `candidate-login.spec.ts` |
| Generic login tests | Specific type-based tests (30 each) |
| Manual credential management | Centralized in `authData.json` |

---
