import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./AdminStats.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function AdminStats() {
  const [stats, setStats] = useState({
    users: 0,
    books: 0,
    categories: 0,
    admins: 0,
  });

  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMonthly();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/stats");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMonthly = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/stats/monthly");

      // format month
      const formatted = res.data.map((item) => ({
        ...item,
        month: item.month.slice(5), // show MM only
      }));

      setMonthly(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const barData = [
    { name: "Users", value: stats.users },
    { name: "Books", value: stats.books },
    { name: "Categories", value: stats.categories },
    { name: "Admins", value: stats.admins },
  ];

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Admin Dashboard</h2>

      {/* STAT CARDS */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>{stats.users}</h3>
          <p>Users</p>
        </div>

        <div className={styles.card}>
          <h3>{stats.books}</h3>
          <p>Books</p>
        </div>

        <div className={styles.card}>
          <h3>{stats.categories}</h3>
          <p>Categories</p>
        </div>

        <div className={styles.card}>
          <h3>{stats.admins}</h3>
          <p>Admins</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className={styles.charts}>
        {/* BAR CHART */}
        <div className={styles.chartBox}>
          <h4>System Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LINE CHART */}
        <div className={styles.chartBox}>
          <h4>Monthly Book Uploads</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default AdminStats;
