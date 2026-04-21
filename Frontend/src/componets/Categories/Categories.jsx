import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Categories.module.css";

function Categories() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className={styles.container} id="categories">
      <h2 className={styles.title}>Browse Categories</h2>

      <div className={styles.grid}>
        {categories.slice(0, 6).map((cat) => (
          <div
            key={cat.id}
            className={styles.card}
            onClick={() => navigate("/login")}
          >
            {/* FIXED IMAGE PATH */}
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

            <h3 className={styles.name}>{cat.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Categories;
