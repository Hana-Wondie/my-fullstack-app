import styles from "./AdminsHero.module.css";
import { useNavigate } from "react-router-dom";

function AdminsHero() {
  const navigate = useNavigate();

  let user = null;

  try {
    const data = localStorage.getItem("user");
    user = data ? JSON.parse(data) : null;
  } catch {
    user = null;
  }

  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <h1 className={styles.title}>Welcome, {user?.name || "Admin"} 👋</h1>

        <p className={styles.subtitle}>
          Manage your digital library, upload books, and control users easily.
        </p>

        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/admin/add-book")}
          >
            Add Book
          </button>

          <button
            className={styles.secondaryBtn}
            onClick={() => navigate("/admin/categories")}
          >
            Manage Categories
          </button>

          {/* ✅ NEW BUTTON */}
          <button
            className={styles.manageUsersBtn}
            onClick={() => navigate("/admin/manage-users")}
          >
            Manage Users
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdminsHero;
