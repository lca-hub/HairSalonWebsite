HAIR SALON FRONTEND - UPDATED SOURCE

1. Replace your current src/ folder with this src/ folder.
2. Run: npm install (only if needed)
3. Run: npm run dev

Main changes:
- One reusable Header.jsx for public/customer pages and staff/admin dashboard mode.
- Protected routes use accessToken JWT claims instead of stored role/email cookies.
- Customer /customer and /customer/profile use the same account UI.
- Customer account UI includes personal information, avatar preview, appointment list, and appointment detail.
- Appointment booking can start with a preselected stylist from /stylists/:id or /appointments/book can let the customer choose a stylist.
- Customer booking request does not send customerId.
- Old AppHeader/PublicHeader files were removed.
