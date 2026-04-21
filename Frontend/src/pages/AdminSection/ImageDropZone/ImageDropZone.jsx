import { useState } from "react";
import axios from "axios";
import styles from "./ImageDropZone.module.css";

function ImageDropZone({ onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // handle file select
  const handleFile = (f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  // drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // upload to backend
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      "http://localhost:3000/api/upload-image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    onUpload(res.data.filename);
  };

  return (
    <div
      className={`${styles.dropzone} ${dragActive ? styles.active : ""}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {!preview ? (
        <p>📁 Drag & Drop image here or click to select</p>
      ) : (
        <img src={preview} alt="preview" className={styles.preview} />
      )}

      {file && (
        <button className={styles.button} onClick={uploadImage}>
          Upload Image
        </button>
      )}
    </div>
  );
}

export default ImageDropZone;
