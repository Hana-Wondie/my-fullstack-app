import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./BrowseCategories.module.css";

function BrowseCategories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleCategoryClick = (id) => {
    navigate(`/books/${id}`);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Browse Categories</h2>

      {/* SEARCH */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className={styles.card}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {/* IMAGE */}
            <img
              src={
                cat.image
                  ? `http://localhost:3000/uploads/${cat.image}`
                  : "https://via.placeholder.com/150"
              }
              alt={cat.name}
              className={styles.image}
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/150")
              }
            />

            {/* NAME */}
            <h3 className={styles.name}>{cat.name}</h3>

            {/* DESCRIPTION (NEW) */}
            <p className={styles.description}>
              {cat.description || "No description available"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BrowseCategories;
