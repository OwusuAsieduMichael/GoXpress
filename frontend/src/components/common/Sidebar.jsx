import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

// Define navigation items with role restrictions
const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["admin", "manager", "cashier"] },
  { to: "/pos", label: "POS Sales", icon: "point_of_sale", roles: ["admin", "manager", "cashier"] },
  { to: "/products", label: "Products", icon: "inventory_2", roles: ["admin", "manager", "cashier"] },
  { to: "/inventory", label: "Inventory", icon: "warehouse", roles: ["admin", "manager", "cashier"] },
  { to: "/customers", label: "Customers", icon: "group", roles: ["admin", "manager", "cashier"] },
  { to: "/reports", label: "Reports", icon: "analytics", roles: ["admin", "manager", "cashier"] }
];

const Sidebar = ({ onNavigate, onToggleSidebar, theme, onSetTheme, isCollapsed }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter navigation items based on user role
  const visibleNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const logoSrc = theme === 'dark' ? '/logo-dark.svg' : '/logo-simple.svg';

  return (
    <aside className={`gxp-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="gxp-brand">
        {!isCollapsed && (
          !logoFailed ? (
            <img
              src={logoSrc}
              alt="GoXpress logo"
              style={{ height: "32px", width: "auto", objectFit: "contain" }}
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="gxp-logo-fallback">GX</div>
              <div>
                <h3>GoXpress</h3>
                <p>Safe Order, Safe Delivery</p>
              </div>
            </div>
          )
        )}
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          type="button"
          aria-label="Toggle sidebar"
        >
          <span className="material-icons-outlined">menu</span>
        </button>
      </div>

      {!isCollapsed && (
        <form className="gxp-search" onSubmit={handleSearch}>
          <span className="material-icons-outlined" aria-hidden="true">
            search
          </span>
          <input 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      )}

      {isCollapsed && (
        <button
          type="button"
          className="gxp-icon-btn"
          onClick={(e) => {
            e.stopPropagation();
            const searchInput = document.querySelector('.gxp-search input');
            if (searchInput) searchInput.focus();
          }}
          title="Search"
        >
          <span className="material-icons-outlined">search</span>
        </button>
      )}

      {!isCollapsed && <p className="gxp-menu-label">MENU</p>}

      <nav className="gxp-nav">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? "gxp-nav-link gxp-nav-link-active" : "gxp-nav-link"
            }
            title={isCollapsed ? item.label : ""}
          >
            <span className="material-icons-outlined gxp-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="gxp-settings-area">
        <button
          type="button"
          className="gxp-settings-toggle"
          onClick={() => {
            navigate("/help");
            onNavigate();
          }}
          title={isCollapsed ? "Help" : ""}
        >
          <span className="material-icons-outlined" aria-hidden="true">
            help_outline
          </span>
          {!isCollapsed && <span>Help</span>}
        </button>

        {isCollapsed ? (
          <div className="gxp-settings-collapsed">
            <button
              type="button"
              className="gxp-theme-toggle-btn"
              onClick={() => onSetTheme(theme === "light" ? "dark" : "light")}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            >
              <span className="material-icons-outlined">
                {theme === "light" ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className={`gxp-settings-toggle ${settingsOpen ? "open" : ""}`}
              onClick={() => setSettingsOpen((prev) => !prev)}
              title="Settings"
            >
              <span className="material-icons-outlined" aria-hidden="true">
                settings
              </span>
              <span>Settings</span>
            </button>

            {settingsOpen && (
              <div className="gxp-settings-panel">
                <p className="gxp-settings-label">THEME</p>
                <div className="gxp-theme-buttons">
                  <button
                    type="button"
                    className={theme === "light" ? "gxp-theme-btn active" : "gxp-theme-btn"}
                    onClick={() => onSetTheme("light")}
                  >
                    <span className="material-icons-outlined" aria-hidden="true">
                      light_mode
                    </span>
                    Light
                  </button>
                  <button
                    type="button"
                    className={theme === "dark" ? "gxp-theme-btn active" : "gxp-theme-btn"}
                    onClick={() => onSetTheme("dark")}
                  >
                    <span className="material-icons-outlined" aria-hidden="true">
                      dark_mode
                    </span>
                    Dark
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
