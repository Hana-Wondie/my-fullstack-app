import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./AddBook.module.css";

function AddBook() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  const [coverImage, setCoverImage] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/categories")
      .then((res) => setCategories(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coverImage || !pdfFile) {
      alert("Please select both image and PDF");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("author", author);
    formData.append("category_id", categoryId);
    formData.append("description", description);

    // MUST BE FILES (NOT STRING)
    formData.append("cover_image", coverImage);
    formData.append("pdf_file", pdfFile);

    try {
      await axios.post("http://localhost:3000/api/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Book added successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to add book");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📚 Add New Book</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label>Book Title</label>
        <input
          type="text"
          placeholder="Enter book title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Author Name</label>
        <input
          type="text"
          placeholder="Enter author name"
          onChange={(e) => setAuthor(e.target.value)}
        />

        <label>Select Category</label>
        <select onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Choose category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Description</label>
        <textarea
          placeholder="Enter book description"
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* FIXED IMAGE INPUT */}
        <label>📷 Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverImage(e.target.files[0])}
        />

        {/* PDF */}
        <label>📄 PDF File</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />

        <button type="submit" className={styles.button}>
          Add Book
        </button>
      </form>
    </div>
  );
}

export default AddBook;
