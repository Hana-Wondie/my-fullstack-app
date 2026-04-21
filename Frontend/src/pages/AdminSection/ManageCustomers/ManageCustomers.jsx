import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManageCustomers.module.css";

function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (term = "", blocked = false) => {
    const res = await axios.get("http://localhost:3000/api/customers", {
      params: {
        search: term,
        blocked,
      },
    });
    setCustomers(res.data);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(search, showBlocked);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    await axios.delete(`http://localhost:3000/api/customers/${id}`);
    fetchCustomers(search, showBlocked);
  };

  const handleBlock = async (id, currentStatus) => {
    await axios.put(`http://localhost:3000/api/customers/${id}/block`, {
      blocked: !currentStatus,
    });

    fetchCustomers(search, showBlocked);
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Manage Customers</h2>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>Search</button>
      </form>

      {/* FILTER */}
      <div className={styles.filter}>
        <label>
          <input
            type="checkbox"
            checked={showBlocked}
            onChange={(e) => {
              setShowBlocked(e.target.checked);
              fetchCustomers(search, e.target.checked);
            }}
          />
          Show Blocked Only
        </label>
      </div>

      {/* TABLE */}
      <div className={styles.table}>
        <div className={styles.header}>
          <span>Name</span>
          <span>Email</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {customers.map((c) => (
          <div key={c.id} className={styles.row}>
            <span>{c.name}</span>
            <span>{c.email}</span>

            <span className={c.is_blocked ? styles.blocked : styles.active}>
              {c.is_blocked ? "Blocked" : "Active"}
            </span>

            <div className={styles.actions}>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(c.id)}
              >
                Delete
              </button>

              <button
                className={c.is_blocked ? styles.unblockBtn : styles.blockBtn}
                onClick={() => handleBlock(c.id, c.is_blocked)}
              >
                {c.is_blocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ManageCustomers;
