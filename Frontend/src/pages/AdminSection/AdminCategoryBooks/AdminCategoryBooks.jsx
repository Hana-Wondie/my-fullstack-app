import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./AdminCategoryBooks.module.css";

function AdminCategoryBooks() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchBooks();
  }, [id]);

  const fetchBooks = async (term = "") => {
    const res = await axios.get(
      `http://localhost:3000/api/categories/${id}/books`,
      { params: { search: term } },
    );
    setBooks(res.data);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const handleDelete = async (bookId) => {
    await axios.delete(`http://localhost:3000/api/books/${bookId}`);
    fetchBooks();
  };

  const handleEdit = (book) => {
    setEditingId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setDescription(book.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (bookId) => {
    await axios.put(`http://localhost:3000/api/books/${bookId}`, {
      title,
      author,
      description,
    });

    setEditingId(null);
    fetchBooks();
  };

  return (
    <section className={styles.container}>
      <h2>Category Books</h2>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          placeholder="Search book..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* ADD BOOK */}
      <button onClick={() => navigate("/admin/add-book")}>+ Add Book</button>

      <div className={styles.grid}>
        {books.map((book) => (
          <div key={book.id} className={styles.card}>
            {/* IMAGE */}
            <img
              src={`http://localhost:3000/uploads/${book.cover_image}`}
              alt={book.title}
              className={styles.image}
            />

            {/* NORMAL VIEW */}
            {editingId !== book.id && (
              <>
                <h3>{book.title}</h3>
                <p>{book.author}</p>

                {/* PDF LINK (IMPORTANT) */}
                <a
                  href={`http://localhost:3000/uploads/${book.pdf_file}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.pdfBtn}
                >
                  📄 Open PDF
                </a>

                <div className={styles.actions}>
                  <button onClick={() => handleEdit(book)}>Edit</button>
                  <button onClick={() => handleDelete(book.id)}>Delete</button>
                </div>
              </>
            )}

            {/* EDIT MODE */}
            {editingId === book.id && (
              <div className={styles.editBox}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                />

                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author"
                />

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                />

                <div className={styles.editActions}>
                  <button onClick={() => handleUpdate(book.id)}>Save</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdminCategoryBooks;
