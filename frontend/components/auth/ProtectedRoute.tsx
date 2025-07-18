import { Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // With the login flow removed, all routes are protected by default.
  // The AuthProvider now provides a static authenticated state.
  return <Outlet />;
}
