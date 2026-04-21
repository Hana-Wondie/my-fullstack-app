import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManageCatagories.module.css";
import { useNavigate } from "react-router-dom";

function ManageCatagories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  // FETCH CATEGORIES (with search)
  const fetchCategories = async (term = "") => {
    try {
      const res = await axios.get("http://localhost:3000/api/categories", {
        params: { search: term },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // SEARCH
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories(search);
  };

  // DELETE CATEGORY
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // START EDIT
  const handleEdit = (cat) => {
    setEditing(cat.id);
    setName(cat.name);
    setDescription(cat.description);
  };

  // UPDATE CATEGORY (NO IMAGE)
  const handleUpdate = async (id) => {
    try {
      await axios.put(`http://localhost:3000/api/categories/${id}`, {
        name,
        description,
      });

      setEditing(null);
      fetchCategories();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Manage Categories</h2>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* ADD BUTTON */}
      <button
        className={styles.addBtn}
        onClick={() => navigate("/admin/add-category")}
      >
        + Add Category
      </button>

      {/* GRID */}
      <div className={styles.grid}>
        {categories.map((cat) => (
          <div key={cat.id} className={styles.card}>
            {/* CLICK IMAGE → OPEN BOOKS */}
            <img
              src={
                cat.image
                  ? `http://localhost:3000/uploads/${cat.image}`
                  : "https://via.placeholder.com/150"
              }
              alt={cat.name}
              onClick={() => navigate(`/admin/categories/${cat.id}/books`)}
            />

            {/* EDIT MODE */}
            {editing === cat.id ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                />

                <button
                  className={styles.saveBtn}
                  onClick={() => handleUpdate(cat.id)}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>

                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEdit(cat)}
                  >
                    Edit
                  </button>

                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(cat.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ManageCatagories;
