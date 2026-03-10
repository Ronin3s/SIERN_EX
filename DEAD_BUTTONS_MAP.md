# 🔴 DEAD BUTTONS MAP — SIERN_EX Project

> All buttons below have **no `onClick` handler** (or have no real functional action tied to them).
> Nothing was edited. This is a read-only audit.
> **Date:** 2026-03-10

---

## 📄 `BehavioralDetection.tsx` — `/behavioral`

| Line | Button Label | Issue |
|------|-------------|-------|
| 245–248 | **"Details"** (per anomaly row, Actions column) | No `onClick` — clicking does nothing |

---

## 📄 `IOCHunt.tsx` — `/ioc-hunt`

| Line | Button Label | Issue |
|------|-------------|-------|
| 250–253 | **"Export Results"** (in Hunt Results card header) | No `onClick` — clicking does nothing |
| 300–302 | **"Investigate"** (per result row, Actions column) | No `onClick` — clicking does nothing |

---

## 📄 `IntegrityScanner.tsx` — `/scanner`

| Line | Button Label | Issue |
|------|-------------|-------|
| 216–219 | **"Create Baseline"** (Quick Actions card) | No `onClick` — clicking does nothing |
| 220–223 | **"Load Baseline"** (Quick Actions card) | No `onClick` — clicking does nothing |
| 275–278 | **"Export Report"** (Scan Results card header) | No `onClick` — clicking does nothing |
| 326–328 | **"View"** (per result row, Actions column) | No `onClick` — clicking does nothing |

---

## 📄 `ProcessMonitor.tsx` — `/processes`

| Line | Button Label | Issue |
|------|-------------|-------|
| 156–159 | **"Export CSV"** (controls bar) | No `onClick` — clicking does nothing |

---

## 📄 `ResponseCenter.tsx` — `/response`

| Line | Button Label | Issue |
|------|-------------|-------|
| 183–185 | **Eye icon button** (per containment row, Actions column) | No `onClick` — clicking does nothing. Should open detail view |

---

## Summary

| Page | Dead Buttons Count |
|------|-------------------|
| BehavioralDetection | 1 |
| IOCHunt | 2 |
| IntegrityScanner | 4 |
| ProcessMonitor | 1 |
| ResponseCenter | 1 |
| **Total** | **9 dead buttons** |

---

> ✅ Pages/components with **all buttons working**: `Dashboard.tsx`, `Login.tsx`, `Register.tsx`, `Settings.tsx`, `Header.tsx`, `Sidebar.tsx`
