import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "./BookListing.module.css";

function BookListing() {
  const { id } = useParams();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    fetchCategory();
    fetchBooks();
  }, [id]);

  // CATEGORY NAME
  const fetchCategory = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/categories");
      const cat = res.data.find((c) => c.id === parseInt(id));
      setCategoryName(cat?.name || "Category");
    } catch (err) {
      console.error(err);
    }
  };

  // BOOKS
  const fetchBooks = async (searchTerm = "") => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/categories/${id}/books`,
        { params: { search: searchTerm } },
      );
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  // DOWNLOAD FIXED
  const handleDownload = (pdfFile) => {
    if (!pdfFile) return alert("File not available");

    const filename = pdfFile.split("/").pop();

    const url = `http://localhost:3000/uploads/${filename}`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // FAVORITES
  const handleAddFavorite = async (bookId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return alert("Login required");
    }

    try {
      await axios.post(
        "http://localhost:3000/api/favorites",
        { book_id: bookId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Added to favorites!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>{categoryName} Books</h2>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchBtn}>
          Search
        </button>
      </form>

      {/* GRID */}
      <div className={styles.grid}>
        {books.map((book) => (
          <div key={book.id} className={styles.card}>
            {/* IMAGE FIX */}
            <img
              src={`http://localhost:3000/uploads/${book.cover_image}`}
              alt={book.title}
              className={styles.image}
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/150")
              }
            />

            <h3 className={styles.name}>{book.title}</h3>
            <p className={styles.author}>{book.author}</p>
            <p className={styles.description}>{book.description}</p>

            <div className={styles.actions}>
              {/* DOWNLOAD FIX */}
              <button
                onClick={() => handleDownload(book.pdf_file)}
                className={styles.downloadBtn}
              >
                Download
              </button>

              {/* FAVORITE */}
              <button
                onClick={() => handleAddFavorite(book.id)}
                className={styles.favBtn}
              >
                Add to Favorites
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BookListing;
