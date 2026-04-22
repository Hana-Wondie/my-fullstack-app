const multer = require("multer");
const path = require("path");

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ================= POSTGRES CONNECTION =================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ================= INIT DB =================
const initDB = async () => {
  console.log("PostgreSQL connected");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE,
      password TEXT,
      role VARCHAR(20) DEFAULT 'user',
      is_blocked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      description TEXT,
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title TEXT,
      author TEXT,
      category_id INT REFERENCES categories(id) ON DELETE CASCADE,
      description TEXT,
      pdf_file TEXT,
      cover_image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      book_id INT REFERENCES books(id) ON DELETE CASCADE,
      UNIQUE(user_id, book_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS downloads (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id),
      book_id INT REFERENCES books(id),
      downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blocked_emails (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) UNIQUE,
      blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
   INSERT INTO users (name, email, password, role)
VALUES (
  'Super Admin',
  'admin@library.com',
  '$2b$10$nSVcNhaQuVO0Z8GO2C8yheh2eNtIh9gMtA9HaNtm80xKvH1ka8TMO',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;
  `);

  console.log("Tables ready");
};

initDB();

// ================= SERVER =================
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// ================= MULTER =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// ================= AUTH =================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const verifySuperAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Only super admin allowed" });
  }
  next();
};

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  const blocked = await pool.query(
    "SELECT * FROM blocked_emails WHERE email=$1",
    [email],
  );

  if (blocked.rows.length > 0)
    return res.status(403).json({ message: "Email blocked" });

  const exist = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

  if (exist.rows.length > 0)
    return res.status(400).json({ message: "User exists" });

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (name,email,password) VALUES ($1,$2,$3)",
    [name, email, hash],
  );

  res.json({ message: "Registered" });
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE email=$1", [
    email,
  ]);

  if (result.rows.length === 0)
    return res.status(401).json({ message: "Invalid" });

  const user = result.rows[0];

  const blocked = await pool.query(
    "SELECT * FROM blocked_emails WHERE email=$1",
    [email],
  );

  if (blocked.rows.length > 0) {
    return res.status(403).json({ message: "Blocked" });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(401).json({ message: "Invalid" });

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);

  res.json({ token, user: payload });
});

// ================= CATEGORIES =================
app.get("/api/categories", async (req, res) => {
  const search = req.query.search || "";

  const result = await pool.query(
    "SELECT * FROM categories WHERE name ILIKE $1",
    [`%${search}%`],
  );

  res.json(result.rows);
});

app.post("/api/categories", upload.single("image"), async (req, res) => {
  const { name, description } = req.body;

  const result = await pool.query(
    "INSERT INTO categories (name,description,image) VALUES ($1,$2,$3)",
    [name, description, req.file?.filename],
  );

  res.json(result.rows);
});

app.put("/api/categories/:id", async (req, res) => {
  const { name, description } = req.body;

  await pool.query(
    "UPDATE categories SET name=$1, description=$2 WHERE id=$3",
    [name, description, req.params.id],
  );

  res.json({ message: "Category updated" });
});

app.delete("/api/categories/:id", async (req, res) => {
  await pool.query("DELETE FROM categories WHERE id=$1", [req.params.id]);

  res.json({ message: "Category deleted" });
});

// ================= BOOKS =================
app.get("/api/categories/:id/books", async (req, res) => {
  const { id } = req.params;
  const search = req.query.search || "";

  const result = await pool.query(
    `SELECT * FROM books 
     WHERE category_id = $1 
     AND title ILIKE $2`,
    [id, `%${search}%`],
  );

  res.json(result.rows);
});

app.post(
  "/api/books",
  upload.fields([{ name: "cover_image" }, { name: "pdf_file" }]),
  async (req, res) => {
    const { title, author, category_id, description } = req.body;

    await pool.query(
      `INSERT INTO books (title,author,category_id,description,cover_image,pdf_file)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        title,
        author,
        category_id,
        description,
        req.files.cover_image[0].filename,
        req.files.pdf_file[0].filename,
      ],
    );

    res.json({ message: "Book added" });
  },
);

app.put("/api/books/:id", async (req, res) => {
  const { title, author, description } = req.body;

  await pool.query(
    "UPDATE books SET title=$1, author=$2, description=$3 WHERE id=$4",
    [title, author, description, req.params.id],
  );

  res.json({ message: "Book updated" });
});

app.delete("/api/books/:id", async (req, res) => {
  await pool.query("DELETE FROM books WHERE id=$1", [req.params.id]);

  res.json({ message: "Book deleted" });
});

// ================= FAVORITES =================
app.post("/api/favorites", authMiddleware, async (req, res) => {
  try {
    await pool.query("INSERT INTO favorites (user_id,book_id) VALUES ($1,$2)", [
      req.user.id,
      req.body.book_id,
    ]);

    res.json({ message: "Added" });
  } catch {
    res.json({ message: "Exists" });
  }
});

app.get("/api/mybooks", authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT f.id, b.*
     FROM favorites f
     JOIN books b ON b.id = f.book_id
     WHERE f.user_id=$1`,
    [req.user.id],
  );

  res.json(result.rows);
});

app.delete("/api/mybooks/:id", authMiddleware, async (req, res) => {
  await pool.query("DELETE FROM favorites WHERE user_id=$1 AND book_id=$2", [
    req.user.id,
    req.params.id,
  ]);

  res.json({ message: "Removed" });
});

// ================= DOWNLOADS =================
app.post("/api/downloads", authMiddleware, async (req, res) => {
  await pool.query("INSERT INTO downloads (user_id,book_id) VALUES ($1,$2)", [
    req.user.id,
    req.body.book_id,
  ]);

  res.json({ message: "Downloaded" });
});

// ================= STATS =================
app.get("/api/stats", async (req, res) => {
  const users = await pool.query("SELECT COUNT(*) FROM users");
  const books = await pool.query("SELECT COUNT(*) FROM books");
  const categories = await pool.query("SELECT COUNT(*) FROM categories");
  const admins = await pool.query(
    "SELECT COUNT(*) FROM users WHERE role IN ('admin','super_admin')",
  );

  res.json({
    users: users.rows[0].count,
    books: books.rows[0].count,
    categories: categories.rows[0].count,
    admins: admins.rows[0].count,
  });
});

app.get("/api/stats/monthly", async (req, res) => {
  const result = await pool.query(`
    SELECT 
      to_char(created_at, 'YYYY-MM') AS month,
      COUNT(*) AS count
    FROM books
    GROUP BY month
    ORDER BY month ASC
    LIMIT 6
  `);

  res.json(result.rows);
});

// ================= CUSTOMER STATS =================
app.get("/api/customer/stats", authMiddleware, async (req, res) => {
  const result = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM favorites WHERE user_id=$1) AS favorites,
      (SELECT COUNT(*) FROM downloads WHERE user_id=$1) AS downloads,
      (SELECT COUNT(DISTINCT b.category_id)
       FROM books b JOIN favorites f ON b.id=f.book_id
       WHERE f.user_id=$1) AS categories`,
    [req.user.id],
  );

  res.json(result.rows[0]);
});

// ================= CUSTOMERS =================
app.get("/api/customers", async (req, res) => {
  const { search = "", blocked } = req.query;

  let query = `
    SELECT u.id,u.name,u.email,
    CASE WHEN b.email IS NOT NULL THEN 1 ELSE 0 END AS is_blocked
    FROM users u
    LEFT JOIN blocked_emails b ON u.email=b.email
    WHERE u.role='user'
  `;

  const params = [];

  if (search) {
    query += " AND u.name ILIKE $1";
    params.push(`%${search}%`);
  }

  if (blocked === "true") {
    query += " AND b.email IS NOT NULL";
  }

  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.delete("/api/customers/:id", async (req, res) => {
  await pool.query("DELETE FROM users WHERE id=$1 AND role='user'", [
    req.params.id,
  ]);

  res.json({ message: "Customer deleted" });
});

app.put("/api/customers/:id/block", async (req, res) => {
  const { blocked } = req.body;

  const user = await pool.query("SELECT email FROM users WHERE id=$1", [
    req.params.id,
  ]);

  const email = user.rows[0].email;

  if (blocked) {
    await pool.query(
      "INSERT INTO blocked_emails (email) VALUES ($1) ON CONFLICT DO NOTHING",
      [email],
    );
    res.json({ message: "Blocked" });
  } else {
    await pool.query("DELETE FROM blocked_emails WHERE email=$1", [email]);
    res.json({ message: "Unblocked" });
  }
});

// ================= ADMINS =================
app.get("/api/admins", async (req, res) => {
  const { search = "", blocked } = req.query;

  let query = `
    SELECT u.id,u.name,u.email,u.role,
    CASE WHEN b.email IS NOT NULL THEN 1 ELSE 0 END AS blocked
    FROM users u
    LEFT JOIN blocked_emails b ON u.email=b.email
    WHERE u.role IN ('admin','super_admin')
  `;

  const params = [];

  if (search) {
    query += " AND u.name ILIKE $1";
    params.push(`%${search}%`);
  }

  if (blocked === "true") {
    query += " AND b.email IS NOT NULL";
  }

  const result = await pool.query(query, params);
  res.json(result.rows);
});

app.post("/api/admins", authMiddleware, async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Only super admin" });
  }

  const { name, email, password, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4)",
    [name, email, hash, role],
  );

  res.json({ message: "Admin created" });
});

app.delete(
  "/api/admins/:id",
  authMiddleware,
  verifySuperAdmin,
  async (req, res) => {
    await pool.query("DELETE FROM users WHERE id=$1 AND role='admin'", [
      req.params.id,
    ]);

    res.json({ message: "Admin deleted" });
  },
);

app.put(
  "/api/admins/:id/block",
  authMiddleware,
  verifySuperAdmin,
  async (req, res) => {
    const { blocked } = req.body;

    const user = await pool.query("SELECT email FROM users WHERE id=$1", [
      req.params.id,
    ]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const email = user.rows[0].email;

    if (blocked) {
      await pool.query(
        "INSERT INTO blocked_emails (email) VALUES ($1) ON CONFLICT DO NOTHING",
        [email],
      );
      return res.json({ message: "Admin blocked" });
    } else {
      await pool.query("DELETE FROM blocked_emails WHERE email=$1", [email]);
      return res.json({ message: "Admin unblocked" });
    }
  },
);

// ================= ADMIN BLOCK =================
app.put("/api/admins/:id/block", async (req, res) => {
  const { blocked } = req.body;

  const user = await pool.query(
    "SELECT email FROM users WHERE id=$1",
    [req.params.id]
  );

  if (user.rows.length === 0)
    return res.status(404).json({ message: "Admin not found" });

  const email = user.rows[0].email;

  if (blocked) {
    await pool.query(
      "INSERT INTO blocked_emails (email) VALUES ($1) ON CONFLICT DO NOTHING",
      [email]
    );
    return res.json({ message: "Admin blocked" });
  } else {
    await pool.query(
      "DELETE FROM blocked_emails WHERE email=$1",
      [email]
    );
    return res.json({ message: "Admin unblocked" });
  }
});