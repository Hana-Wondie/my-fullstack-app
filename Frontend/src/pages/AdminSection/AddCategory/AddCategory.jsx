import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./AddCategory.module.css";

function AddCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // handle image
  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !image) {
      alert("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);

    try {
      await axios.post("http://localhost:3000/api/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Category added successfully!");
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      alert("Failed to add category");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📁 Add New Category</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* NAME */}
        <label>Category Name</label>
        <input
          type="text"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* DESCRIPTION */}
        <label>Description</label>
        <textarea
          placeholder="Enter category description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* IMAGE */}
        <label>Category Image</label>
        <input type="file" accept="image/*" onChange={handleImage} />

        {/* PREVIEW */}
        {preview && (
          <div className={styles.previewBox}>
            <p>Image Preview:</p>
            <img src={preview} alt="preview" />
          </div>
        )}

        {/* BUTTON */}
        <button type="submit" className={styles.button}>
          Add Category
        </button>
      </form>
    </div>
  );
}

export default AddCategory;
