
# Modernization Changes

- Modern sticky Header with cart badge and Auth buttons (Login/Register).
- Added pages: Login, Register, AdminDashboard.
- Added ProtectedRoute for `/admin` (admin-only via role).
- State: `zustand` stores for `auth` and `cart` (persisted).
- Alias `@/*` configured in tsconfig + vite.
- Global minimal styles in `src/styles/global.css`.

## Next steps
- Wire Login/Register to real backend endpoints.
- Replace demo role logic in `Login.tsx`.
- Hook product list and cart buttons to `useCart().add(...)`.
