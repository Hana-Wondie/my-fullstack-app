import { useState } from "react";
import axios from "axios";
import styles from "./AddAdmin.module.css";

function AddAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (user?.role !== "super_admin") {
      alert("Only super admin can add admins");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/api/admins",
        { name, email, password, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Admin created successfully");

      setName("");
      setEmail("");
      setPassword("");
      setRole("admin");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating admin");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Add Admin</h2>

      {user?.role !== "super_admin" ? (
        <p className={styles.error}>Access Denied</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <button type="submit">Create Admin</button>
        </form>
      )}
    </div>
  );
}

export default AddAdmin;
