import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./MyBooks.module.css";

function MyBooks() {
  const [books, setBooks] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/mybooks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching favorite books:", err);
    }
  };

  const handleRemove = async (bookId) => {
    try {
      await axios.delete(`http://localhost:3000/api/mybooks/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBooks(books.filter((b) => b.id !== bookId));
    } catch (err) {
      console.error("Error removing favorite book:", err);
    }
  };

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>My Favorite Books</h2>

      {books.length === 0 ? (
        <p className={styles.empty}>You have no favorite books yet.</p>
      ) : (
        <div className={styles.grid}>
          {books.map((book) => (
            <div key={book.id} className={styles.card}>
              <img
                src={
                  book.cover_image
                    ? `http://localhost:3000/uploads/${book.cover_image}`
                    : "https://via.placeholder.com/150"
                }
                alt={book.title}
                className={styles.image}
              />

              <h3 className={styles.name}>{book.title}</h3>
              <p className={styles.author}>Author: {book.author}</p>
              <p className={styles.category}>Category: {book.category_name}</p>

              <div className={styles.actions}>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(book.id)}
                >
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyBooks;
