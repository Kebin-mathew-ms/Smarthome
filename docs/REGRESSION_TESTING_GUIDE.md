# SQA Automated Regression Testing Guide

## Overview
This regression test suite (`server/tests/regression.test.js`) automatically verifies that recent enhancements (such as Phase 9 Security Hardening & Phase 10 Employee Portal) do not break existing business contracts across Admin, Company, Customer, Bookings, Payments, Chat, or Analytics modules.

---

## Regression Verification Coverage

1. **API Envelope Consistency**: Ensures all APIs return uniform JSON payloads (`{ success, message, data }`).
2. **Role Permission Matrix**: Verifies strict role boundaries for **Admin**, **Company**, **Employee**, and **Customer**.
3. **Database Schema Integrity**: Ensures all 20 sequential database migrations exist without missing tables.
4. **Error Handling Integrity**: Confirms 401 Unauthorized and 404 Not Found responses do not leak stack traces in production.

---

## Running Automated Regression Tests
```bash
npm test -- server/tests/regression.test.js
```
