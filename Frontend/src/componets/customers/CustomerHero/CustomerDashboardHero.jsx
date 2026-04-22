import styles from "./CustomerDashboardHero.module.css";
import { useNavigate } from "react-router-dom";

function CustomerDashboardHero() {
  const navigate = useNavigate();

  const handleBrowseBooks = () => {
    navigate("/browse-books");
  };

  const handleMyBooks = () => {
    navigate("/my-books");
  };

  // Get user from localStorage
  let user = null;
  try {
    const userData = localStorage.getItem("user");
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  return (
    <section className={styles.heroSection}>
      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1 className={styles.title}>
            Welcome{user ? `, ${user.name}` : ""}!
          </h1>

          <p className={styles.subtitle}>
            Discover, read, and download books freely anytime.
          </p>

          <div className={styles.buttons}>
            {/* ✅ ALWAYS AVAILABLE */}
            <button
              className={`${styles.btn} ${styles.browseBtn}`}
              onClick={handleBrowseBooks}
            >
              Browse Books
            </button>

            {/* ✅ ONLY IF LOGGED IN */}
            {user && (
              <button
                className={`${styles.btn} ${styles.myBooksBtn}`}
                onClick={handleMyBooks}
              >
                My Books
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CustomerDashboardHero;
