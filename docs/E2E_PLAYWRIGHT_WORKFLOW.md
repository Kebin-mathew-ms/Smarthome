# SQA End-to-End (E2E) Playwright Test Automation Guide

## Overview
This Playwright test suite (`client/e2e/full_workflow.spec.js`) simulates the complete lifecycle of an enterprise service request across all 4 system roles (**Customer**, **Company Manager**, **Field Technician**, and **Admin**).

---

## E2E Lifecycle Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    actor M as Company Manager
    actor T as Field Technician
    participant S as System Platform

    C->>S: 1. Register & Login Account
    C->>S: 2. Browse Marketplace & View Company Services
    C->>S: 3. Complete 4-Step Booking Wizard & Payment
    M->>S: 4. Company Login & Accept Booking Request
    M->>S: 5. Assign Technician Staff to Dispatch
    T->>S: 6. Technician Login & Open Assigned Job
    T->>S: 7. GPS Check-In & Update Status to 'Work Started'
    T->>S: 8. Open Real-Time Chat & Post Work Progress Photo
    T->>S: 9. Capture Customer Digital Signature & Complete Job
    C->>S: 10. Customer Submits 5-Star Review & Downloads Invoice (INV-YYYYMMDD-XXXX)
```

---

## Running the Playwright Test Suite

### 1. Prerequisites
Ensure the application backend and frontend dev servers are running:
```bash
# Terminal 1: Backend Server (Port 5000)
node server/index.js

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

### 2. Execute Playwright E2E Spec
```bash
npx playwright test client/e2e/full_workflow.spec.js --headed
```
