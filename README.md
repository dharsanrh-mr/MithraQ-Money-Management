# Mithra Expenses Tracker – Settings + Daily/Monthly Reports

Replace the existing GitHub Pages `index.html` with this file.

Added:
- Settings option with currency, theme and default report preference.
- Daily Report: choose a date, view that day's expenses and download CSV.
- Monthly Report: choose a month, view expenses + salary + EMI and download CSV.
- Existing EMI repayment schedule, Loan, Salary, Expenses and backup features retained.
- Responsive mobile/desktop UI.


## iMobile-inspired UI update
- Added `imobile-inspired.css` for an orange/white modern banking-style interface.
- Existing MithraQ data structures, pages, reports, document vault and local persistence are preserved.
- Added `data-safety.js`, which stores up to 5 point-in-time safety snapshots in a separate IndexedDB database before persistence.
- No migration/reset/clear operation is performed by the UI update.
