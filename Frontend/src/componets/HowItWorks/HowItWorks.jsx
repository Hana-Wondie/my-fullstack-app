import styles from "./HowItWorks.module.css";
import { useNavigate } from "react-router-dom";

function HowItWorks() {
  const navigate = useNavigate();

  // ✅ Check user from localStorage
  let user = null;
  try {
    const userData = localStorage.getItem("user");
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const handleGetStarted = () => {
    if (!user) {
      // Not logged in → go to login
      navigate("/login");
    } else {
      // Logged in → go to dashboard based on role
      if (user.role === "admin" || user.role === "super_admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    }
  };

  return (
    <section className={styles.container} id="howitworks">
      <h2 className={styles.title}>How It Works</h2>

      <div className={styles.steps}>
        {/* Step 1 */}
        <div className={styles.card}>
          <div className={styles.icon}>📝</div>
          <h3>Create Account</h3>
          <p>Sign up easily with your name, email, and password.</p>
        </div>

        {/* Step 2 */}
        <div className={styles.card}>
          <div className={styles.icon}>📚</div>
          <h3>Browse Books</h3>
          <p>Explore categories and discover thousands of books.</p>
        </div>

        {/* Step 3 */}
        <div className={styles.card}>
          <div className={styles.icon}>⬇️</div>
          <h3>Download & Save</h3>
          <p>Download books or add them to your favorites list.</p>
        </div>
      </div>

      {/* Get Started Button */}
      <button className={styles.button} onClick={handleGetStarted}>
        Get Started
      </button>
    </section>
  );
}

export default HowItWorks;
