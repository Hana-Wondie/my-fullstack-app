import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Header.module.css";

function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ✅ NEW: scroll handler
  const handleScroll = (id) => {
    navigate("/"); // go to landing page first

    setTimeout(() => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // wait for page load
  };

  let user = null;
  try {
    const userData = localStorage.getItem("user");
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  return (
    <header className={styles.header}>
      <Link
        to={
          user?.role === "admin" || user?.role === "super_admin"
            ? "/admin/dashboard"
            : "/"
        }
        className={styles.logo}
      >
        📚 Digital Library
      </Link>

      {/* Hamburger menu button */}
      <button
        className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`${styles.nav} ${menuOpen ? styles.active : ""}`}>
        {/* ✅ NEW LINKS (always visible) */}
        <Link
          to="#"
          className={styles.navLink}
          onClick={() => {
            handleScroll("howitworks");
            setMenuOpen(false);
          }}
        >
          How It Works
        </Link>

        <Link
          to="#"
          className={styles.navLink}
          onClick={() => {
            handleScroll("categories");
            setMenuOpen(false);
          }}
        >
          Categories
        </Link>

        <Link
          to="#"
          className={styles.navLink}
          onClick={() => {
            handleScroll("testimonials");
            setMenuOpen(false);
          }}
        >
          Testimonials
        </Link>

        {!user ? (
          <>
            <Link
              to="/signup"
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              Signup
            </Link>
            <Link
              to="/login"
              className={styles.navLink}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <span className={styles.welcome}>Hi {user.name}</span>
            <button
              className={styles.logoutBtn}
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
