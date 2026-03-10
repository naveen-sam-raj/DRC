import Home from "./home.jsx";
import Admin from "./Admin.jsx";

export default function App() {
  // Simple path-based routing — /admin → Admin, everything else → Home
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? <Admin /> : <Home />;
}
