import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManageAdmins.module.css";
import { useNavigate } from "react-router-dom";

function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAdmins();
  }, [showBlocked]);

  const fetchAdmins = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/admins", {
        params: {
          search,
          blocked: showBlocked,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdmins();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this admin?")) return;

    await axios.delete(`http://localhost:3000/api/admins/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchAdmins();
  };

  const handleBlock = async (admin) => {
    await axios.put(
      `http://localhost:3000/api/admins/${admin.id}/block`,
      { blocked: true },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    fetchAdmins();
  };

  const handleUnblock = async (admin) => {
    await axios.put(
      `http://localhost:3000/api/admins/${admin.id}/block`,
      { blocked: false },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    fetchAdmins();
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Manage Admins</h2>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          placeholder="Search admin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>Search</button>
      </form>

      {/* ACTIONS */}
      <div className={styles.topActions}>
        <button onClick={() => navigate("/admin/add-admin")}>
          + Add Admin
        </button>

        <button onClick={() => setShowBlocked(!showBlocked)}>
          {showBlocked ? "Show All" : "Show Blocked"}
        </button>
      </div>

      {/* TABLE */}
      <div className={styles.table}>
        <div className={styles.header}>
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {admins.map((admin) => (
          <div key={admin.id} className={styles.row}>
            <span>{admin.name}</span>
            <span>{admin.email}</span>

            <span className={admin.blocked ? styles.blocked : styles.active}>
              {admin.blocked ? "Blocked" : "Active"}
            </span>

            <div className={styles.actions}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(admin.id)}
              >
                Delete
              </button>

              {admin.blocked ? (
                <button
                  className={styles.unblockBtn}
                  onClick={() => handleUnblock(admin)}
                >
                  Unblock
                </button>
              ) : (
                <button
                  className={styles.blockBtn}
                  onClick={() => handleBlock(admin)}
                >
                  Block
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ManageAdmins;
