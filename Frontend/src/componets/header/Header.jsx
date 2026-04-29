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

  const handleScroll = (id) => {
    navigate("/");

    setTimeout(() => {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
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
        {/* ✅ NEW SVG LOGO */}
        <svg
          className={styles.logoIcon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 10C8 8.9 8.9 8 10 8H22C24.2 8 26 9.8 26 12V40C26 37.8 24.2 36 22 36H10C8.9 36 8 35.1 8 34V10Z"
            fill="#2563EB"
          />
          <path
            d="M40 10C40 8.9 39.1 8 38 8H26C23.8 8 22 9.8 22 12V40C22 37.8 23.8 36 26 36H38C39.1 36 40 35.1 40 34V10Z"
            fill="#1E40AF"
          />
          <line
            x1="24"
            y1="12"
            x2="24"
            y2="36"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <span className={styles.logoText}>
          Digital<span>Library</span>
        </span>
      </Link>

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
