import { useAuth } from "../../context/AuthContext.jsx";

const Topbar = ({ onOpenMenu, onResetTheme }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (onResetTheme) {
      onResetTheme("light");
    }
    logout();
  };

  return (
    <header className="topbar">
      <div className="topbar-actions">
        <div className="user-meta top-right-user">
          <span>{user?.fullName || "User"}</span>
          <span className="user-role">{user?.role || "cashier"}</span>
        </div>
        <button type="button" className="danger-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
