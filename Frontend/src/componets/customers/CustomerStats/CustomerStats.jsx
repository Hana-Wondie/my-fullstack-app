import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./CustomerStats.module.css";

function CustomerStats() {
  const [stats, setStats] = useState({
    favorites: 0,
    downloads: 0,
    categories: 0,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ If no token → don't fetch
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    setIsLoggedIn(true);

    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/customer/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setStats({
          favorites: res.data.favorites,
          downloads: res.data.downloads,
          categories: res.data.categories,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  // ✅ Hide section for guests
  if (!isLoggedIn) return null;

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Your Stats</h2>

      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.icon}>⭐</div>
          <div className={styles.number}>{stats.favorites}</div>
          <div className={styles.label}>Favorites</div>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>⬇️</div>
          <div className={styles.number}>{stats.downloads}</div>
          <div className={styles.label}>Downloaded</div>
        </div>

        <div className={styles.card}>
          <div className={styles.icon}>📚</div>
          <div className={styles.number}>{stats.categories}</div>
          <div className={styles.label}>Categories</div>
        </div>
      </div>
    </section>
  );
}

export default CustomerStats;
