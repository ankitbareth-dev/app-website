import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../store/AppContext";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [isLogoutDropdownOpen, setIsLogoutDropdownOpen] = useState(false);
  /*  const [isAttendanceDropdownOpen, setIsAttendanceDropdownOpen] =
    useState(false); */
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const { logout, user } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    /* setIsAttendanceDropdownOpen(false); */
    setIsMenuDropdownOpen(false);
  };

  const initiateLogout = () => {
    setShowLogoutConfirmation(true);
    setIsLogoutDropdownOpen(false); // Close the dropdown when showing confirmation
  };

  const confirmLogout = async (confirmed) => {
    setShowLogoutConfirmation(false);
    if (confirmed) {
      await logout();
      navigate("/");
    }
  };

  const navigationItems = [
    /* { path: "/expenses", label: "Expenses", icon: "💰" }, */
  ];

  const getHeaderText = () => {
    const pathMap = {
      "/dashboard": "Dashboard",
      "/attendance": "Attendance",
      "/manual-attendance": "Manual Attendance",
      "/attendance-history": "History",
      "/expenses": "Expenses",
      "/profile": "Profile",
      "/incidents": "Incidents",
      "/tickets": "Tickets",
      "/about": "About",
    };
    return pathMap[location.pathname] || "Dashboard";
  };

  const mobileNavItems = [
    { path: "/dashboard", label: "Home", icon: "🏠" },
    { path: "/attendance", label: "Attendance", icon: "⏰" },
    /* { path: "/expenses", label: "Expenses", icon: "💰" }, */
    { path: "/incidents", label: "Incidents", icon: "🚨" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <>
      {showLogoutConfirmation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirm Logout</h3>
            <p>Do you really want to logout?</p>
            <div className={styles.modalButtons}>
              <button
                className={styles.cancelButton}
                onClick={() => confirmLogout(false)}
              >
                No
              </button>
              <button
                className={styles.confirmButton}
                onClick={() => confirmLogout(true)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop & Mobile Navbar */}
      <nav className={styles.navbar}>
        {/* Desktop Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.brandContainer}>
            <div className={styles.brandIcon}>⚡</div>
            <h1 className={styles.title}>{getHeaderText()}</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          <div className={styles.navLinks}>
            {/* Dashboard */}
            <button
              className={`${styles.navLink} ${
                location.pathname === "/dashboard" ? styles.activeNavLink : ""
              }`}
              onClick={() => handleNavigation("/dashboard")}
            >
              <span className={styles.navIcon}>🏠</span>
              Dashboard
            </button>

            <button
              className={`${styles.navLink} ${
                location.pathname === "/attendance" ? styles.activeNavLink : ""
              }`}
              onClick={() => handleNavigation("/attendance")}
            >
              <span className={styles.navIcon}>🏠</span>
              Attendance
            </button>

            <button
              className={`${styles.navLink} ${
                location.pathname === "/incidents" ? styles.activeNavLink : ""
              }`}
              onClick={() => handleNavigation("/incidents")}
            >
              <span className={styles.navIcon}>🏠</span>
              Incidents
            </button>

            {/* Profile Link */}
            <button
              className={`${styles.navLink} ${
                location.pathname === "/profile" ? styles.activeNavLink : ""
              }`}
              onClick={() => handleNavigation("/profile")}
            >
              <span className={styles.navIcon}>👤</span>
              Profile
            </button>

            {/* Other Navigation Items */}
            {navigationItems.map((item) => (
              <button
                key={item.path}
                className={`${styles.navLink} ${
                  location.pathname === item.path ? styles.activeNavLink : ""
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* User Profile Dropdown */}
          <div className={styles.dropdownContainer}>
            <button
              className={styles.userButton}
              onClick={() => setIsLogoutDropdownOpen(!isLogoutDropdownOpen)}
            >
              <div className={styles.userAvatar}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className={styles.userName}>{user?.name || "User"}</span>
              <span
                className={`${styles.arrow} ${
                  isLogoutDropdownOpen ? styles.arrowUp : ""
                }`}
              >
                ▼
              </span>
            </button>

            {isLogoutDropdownOpen && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => handleNavigation("/about")}
                >
                  <span>ℹ️</span>
                  About
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={initiateLogout}
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileBrand}>
            <div className={styles.brandIcon}>⚡</div>
            <h1 className={styles.mobileTitle}>{getHeaderText()}</h1>
          </div>
          <div className={styles.dropdownContainer}>
            <button
              className={styles.mobileLogoutBtn}
              onClick={() => setIsLogoutDropdownOpen(!isLogoutDropdownOpen)}
            >
              🚪
            </button>
            {isLogoutDropdownOpen && (
              <div className={`${styles.dropdown} ${styles.mobileDropdown}`}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => handleNavigation("/about")}
                >
                  <span>ℹ️</span>
                  About
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={initiateLogout}
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className={styles.mobileBottomNav}>
        {mobileNavItems.map((item) => (
          <button
            key={item.path}
            className={`${styles.mobileNavItem} ${
              location.pathname === item.path ? styles.activeMobileNavItem : ""
            }`}
            onClick={() => handleNavigation(item.path)}
          >
            <span className={styles.mobileNavIcon}>{item.icon}</span>
            <span className={styles.mobileNavLabel}>{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default Navbar;
