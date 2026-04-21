import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Stats.module.css";

function Stats() {
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    categories: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Our Library in Numbers</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>{stats.books}+</h3>
          <p>Books</p>
        </div>

        <div className={styles.card}>
          <h3>{stats.users}+</h3>
          <p>Users</p>
        </div>

        <div className={styles.card}>
          <h3>{stats.categories}+</h3>
          <p>Categories</p>
        </div>
      </div>
    </section>
  );
}

export default Stats;
