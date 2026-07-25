# SQA Database Integrity & Verification Suite

## Overview
This verification suite (`server/scripts/verify_database_integrity.js`) performs automated relational and logical checks across database `home` to guarantee zero orphan records, cross-tenant isolation, review eligibility constraints, and technician company matching.

---

## Checked Database Integrity Constraints

```mermaid
graph TD
    A[Database Integrity Runner] --> B[Check 1: Valid Customer Accounts on Bookings]
    A --> C[Check 2: Technician Belongs to Matching Company]
    A --> D[Check 3: Payment References Valid Booking]
    A --> E[Check 4: Chat Messages Belong to Valid Room]
    A --> F[Check 5: Reviews Restricted to 'Completed' Status]
    A --> G[Check 6: No Orphan Records in GPS Check-Ins / Signatures]
    A --> H[Check 7: Soft Deletes & Active Employee Status Integrity]
```

---

## Execution Command
```bash
node server/scripts/verify_database_integrity.js
```
