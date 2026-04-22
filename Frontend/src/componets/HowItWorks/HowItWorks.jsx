import styles from "./HowItWorks.module.css";
import { useNavigate } from "react-router-dom";

function HowItWorks() {
  const navigate = useNavigate();

  // Get user from localStorage
  let user = null;
  try {
    const userData = localStorage.getItem("user");
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const handleGetStarted = () => {
    // ✅ ADMIN → go to admin dashboard
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      navigate("/admin/dashboard");
    } else {
      // ✅ EVERYONE ELSE (guest + users) → browse books
      navigate("/browse-books"); // or "/categories"
    }
  };

  return (
    <section className={styles.container} id="howitworks">
      <h2 className={styles.title}>How It Works</h2>

      <div className={styles.steps}>
        {/* Step 1 */}
        <div className={styles.card}>
          <div className={styles.icon}>📝</div>
          <h3>Create Account (Optional)</h3>
          <p>You can sign up to save favorites and track your activity.</p>
        </div>

        {/* Step 2 */}
        <div className={styles.card}>
          <div className={styles.icon}>📚</div>
          <h3>Browse Books</h3>
          <p>Explore categories and discover thousands of books freely.</p>
        </div>

        {/* Step 3 */}
        <div className={styles.card}>
          <div className={styles.icon}>⬇️</div>
          <h3>Read & Download</h3>
          <p>Read online or download books instantly — no login required.</p>
        </div>
      </div>

      {/* BUTTON */}
      <button className={styles.button} onClick={handleGetStarted}>
        Get Started
      </button>
    </section>
  );
}

export default HowItWorks;
