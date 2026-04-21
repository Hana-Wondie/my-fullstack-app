const multer = require("multer");
const path = require("path");

require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ FIX: connect WITHOUT database first
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
    return;
  }

  console.log("Database connected");

  // ✅ FIX: create database
  connection.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    (err) => {
      if (err) {
        console.error("Error creating database:", err);
        return;
      }

      connection.query(`USE ${process.env.DB_NAME}`, (err) => {
        if (err) {
          console.error("Error selecting database:", err);
          return;
        }

        console.log("Database selected");

        // users Table
        const users = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
          is_blocked BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;

        connection.query(users, (err) => {
          if (err) {
            console.error("Error creating users table:", err);
          } else {
            console.log("users table ready");
          }
        });

        // categories Table
        const categories = `
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;

        connection.query(categories, (err) => {
          if (err) {
            console.error("Error creating categories table:", err);
          } else {
            console.log("categories table ready");
          }
        });

        // books Table
        const books = `
        CREATE TABLE IF NOT EXISTS books (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(255) NOT NULL,
          category_id INT,
          description TEXT,
          pdf_file VARCHAR(255),
          cover_image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );`;

        connection.query(books, (err) => {
          if (err) {
            console.error("Error creating books table:", err);
          } else {
            console.log("books table ready");
          }
        });

        // favorites Table
        const favourites = `
        CREATE TABLE IF NOT EXISTS favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          book_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );`;

        connection.query(favourites, (err) => {
          if (err) {
            console.error("Error creating favourites table:", err);
          } else {
            console.log("Favourites table ready");
          }
        });

        // downloads Table
        const downloads = `
        CREATE TABLE IF NOT EXISTS downloads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          book_id INT,
          downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (book_id) REFERENCES books(id)
        );`;

        connection.query(downloads, (err) => {
          if (err) {
            console.error("Error creating downloads table:", err);
          } else {
            console.log("Downloads table ready");
          }
        });

        // blocked emails table
        const blockedEmails = `
        CREATE TABLE IF NOT EXISTS blocked_emails (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`;

        connection.query(blockedEmails, (err) => {
          if (err) {
            console.error("Error creating blocked emails table:", err);
          } else {
            console.log("Blocked emails table ready");
          }
        });

        // ✅ FIX: insert super admin
        const adminInsert = `
        INSERT IGNORE INTO users (id, name, email, password, role)
        VALUES (1, 'Super Admin', 'admin@library.com', '$2b$10$nSVcNhaQuVO0Z8GO2C8yheh2eNtIh9gMtA9HaNtm80xKvH1ka8TMO', 'super_admin')
        `;

        connection.query(adminInsert);
      });
    },
  );
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// for mutter file uploads

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// middelware to check if user is admin
const verifySuperAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      message: "Only super admin can perform this action",
    });
  }
  next();
};

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please provide all fields",
    });
  }

  // ✅ NEW: check blocked email
  const blockedCheck = `SELECT * FROM blocked_emails WHERE email = ?`;

  connection.query(blockedCheck, [email], (err, blockedResult) => {
     if (err) {
       return res.status(500).json({
         message: "Database error (blocked check)",
       });
     }
    if (blockedResult.length > 0) {
      return res.status(403).json({
        message: "This email is blocked",
      });
    }

    const selectQuery = `SELECT * FROM users WHERE email = ?`;

    connection.query(selectQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          message: "Database error",
        });
      }

      if (results.length > 0) {
        return res.status(400).json({
          message: "User already registered",
        });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ FIXED QUERY (removed phone)
        const insertQuery = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
        `;

        connection.query(insertQuery, [name, email, hashedPassword], (err) => {
          if (err) {
            return res.status(500).json({
              message: "Failed to register user",
            });
          }

          res.status(201).json({
            message: "User registered successfully",
          });
        });
      } catch (error) {
        res.status(500).json({
          message: "Password hashing failed",
        });
      }
    });
  });
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  const selectQuery = `SELECT * FROM users WHERE email = ?`;

  connection.query(selectQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = results[0];

    // ✅ FIX: block login
    if (user.is_blocked) {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // ✅ FIXED payload
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(200).json({
        message: "Login successful",
        token: token,
        user: payload,
      });
    } catch (error) {
      res.status(500).json({
        message: "Authentication failed",
      });
    }
  });
});

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication invalid. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication invalid. Token missing.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// route to get all catagories
app.get("/api/categories", (req, res) => {
  const search = req.query.search || "";

  const query = `
    SELECT * FROM categories
    WHERE name LIKE ?
  `;

  connection.query(query, [`%${search}%`], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch categories",
      });
    }

    res.json(results);
  });
});

// rote to add category
app.post("/api/categories", upload.single("image"), (req, res) => {
  const { name, description } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !description || !image) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql =
    "INSERT INTO categories (name, description, image) VALUES (?, ?, ?)";

  connection.query(sql, [name, description, image], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", err });
    }

    res.json({
      message: "Category created successfully",
      id: result.insertId,
    });
  });
});
// ================= FETCH ALL CATEGORIES (FOR ADMIN) =================
app.get("/api/admin/categories", (req, res) => {
  const query = "SELECT * FROM categories";

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch categories",
      });
    }

    res.json(results);
  });
});

// ================= FETCH BOOKS BY CATEGORY =================
app.get("/api/categories/:id/books", (req, res) => {
  const categoryId = req.params.id;
  const { search } = req.query; // optional search by book name

  let query = `
    SELECT id, title, author, cover_image, description, pdf_file
    FROM books
    WHERE category_id = ?
  `;

  const params = [categoryId];

  if (search) {
    query += ` AND title LIKE ?`;
    params.push(`%${search}%`);
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching books:", err);
      return res.status(500).json({ message: "Failed to fetch books" });
    }

    res.json(results);
  });
});

// add books
app.post(
  "/api/books",
  upload.fields([
    { name: "cover_image", maxCount: 1 },
    { name: "pdf_file", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const { title, author, category_id, description } = req.body;

      if (!req.files || !req.files.cover_image || !req.files.pdf_file) {
        return res.status(400).json({ message: "Files missing" });
      }

      const cover_image = req.files.cover_image[0].filename;
      const pdf_file = req.files.pdf_file[0].filename;

      const sql = `
        INSERT INTO books (title, author, category_id, description, cover_image, pdf_file)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      connection.query(
        sql,
        [title, author, category_id, description, cover_image, pdf_file],
        (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "DB insert error" });
          }

          res.json({ message: "Book added successfully" });
        },
      );
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server crash" });
    }
  },
);
// delete book
app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM books WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting book:", err);
      return res.status(500).json({
        message: "Failed to delete book",
      });
    }

    // ✅ check if book exists
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json({
      message: "Book deleted successfully",
    });
  });
});

// update book
app.put("/api/books/:id", (req, res) => {
  const { title, author, description } = req.body;

  connection.query(
    "UPDATE books SET title=?, author=?, description=? WHERE id=?",
    [title, author, description, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Update failed" });

      res.json({ message: "Book updated" });
    },
  );
});
// ================= ADD TO FAVORITES =================
app.post("/api/favorites", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { book_id } = req.body;

  if (!book_id) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  const query = "INSERT INTO favorites (user_id, book_id) VALUES (?, ?)";

  connection.query(query, [userId, book_id], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Book already in favorites" });
      }
      return res.status(500).json({ message: "Failed to add favorite" });
    }

    res.status(200).json({ message: "Book added to favorites" });
  });
});

// Get user's favorite books
app.get("/api/mybooks", authMiddleware, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT f.id AS fav_id, b.id, b.title, b.author, b.cover_image, c.name AS category_name
    FROM favorites f
    JOIN books b ON f.book_id = b.id
    JOIN categories c ON b.category_id = c.id
    WHERE f.user_id = ?
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to fetch favorite books" });
    }
    res.json(results);
  });
});

// Remove book from favorites
app.delete("/api/mybooks/:bookId", authMiddleware, (req, res) => {
  const userId = req.user.id;
  const bookId = req.params.bookId;

  const query = "DELETE FROM favorites WHERE user_id = ? AND book_id = ?";
  connection.query(query, [userId, bookId], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to remove favorite book" });
    }
    res.json({ message: "Book removed from favorites" });
  });
});

// getting stats from the database
app.get("/api/stats", (req, res) => {
  const stats = {};

  connection.query(
    "SELECT COUNT(*) AS users FROM users",
    (err, usersResult) => {
      if (err) return res.status(500).json({ message: "Error fetching users" });

      stats.users = usersResult[0].users;

      connection.query(
        "SELECT COUNT(*) AS books FROM books",
        (err, booksResult) => {
          if (err)
            return res.status(500).json({ message: "Error fetching books" });

          stats.books = booksResult[0].books;

          connection.query(
            "SELECT COUNT(*) AS categories FROM categories",
            (err, catResult) => {
              if (err)
                return res
                  .status(500)
                  .json({ message: "Error fetching categories" });

              stats.categories = catResult[0].categories;

              // ✅ NEW: count admins
              connection.query(
                "SELECT COUNT(*) AS admins FROM users WHERE role IN ('admin','super_admin')",
                (err, adminResult) => {
                  if (err)
                    return res
                      .status(500)
                      .json({ message: "Error fetching admins" });

                  stats.admins = adminResult[0].admins;

                  // ✅ FINAL RESPONSE (moved here)
                  res.json(stats);
                },
              );
            },
          );
        },
      );
    },
  );
});

// ================= CUSTOMER STATS =================
app.get("/api/customer/stats", authMiddleware, (req, res) => {
  const userId = req.user.id; // from JWT payload

  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM favorites WHERE user_id = ?) AS favorites,
      (SELECT COUNT(*) FROM downloads WHERE user_id = ?) AS downloads,
      (SELECT COUNT(DISTINCT b.category_id)
         FROM books b
         JOIN favorites f ON b.id = f.book_id
         WHERE f.user_id = ?) AS categories
  `;

  connection.query(statsQuery, [userId, userId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching customer stats:", err);
      return res.status(500).json({ message: "Server error" });
    }

    const stats = results[0];
    res.json({
      favorites: stats.favorites,
      downloads: stats.downloads,
      categories: stats.categories,
    });
  });
});

// monthly stats (last 6 months)
app.get("/api/stats/monthly", (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM books
    GROUP BY month
    ORDER BY month ASC
    LIMIT 6
  `;

  connection.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching monthly stats",
      });
    }

    res.json(result);
  });
});

// delete category (admin only)
app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM categories WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Delete failed" });
    }

    res.json({ message: "Category deleted" });
  });
});

// update category (admin only)

app.put("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  connection.query(
    "UPDATE categories SET name=?, description=? WHERE id=?",
    [name, description, id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Update failed" });
      }

      res.json({ message: "Category updated" });
    },
  );
});


// upload route
app.post("/api/upload-image", upload.fields("image"), (req, res) => {
  res.json({ filename: req.file.filename });
});


// get customer with blocked status
app.get("/api/customers", (req, res) => {
  const { search = "", blocked } = req.query;

  let query = `
    SELECT u.id, u.name, u.email,
    CASE WHEN b.email IS NOT NULL THEN 1 ELSE 0 END AS is_blocked
    FROM users u
    LEFT JOIN blocked_emails b ON u.email = b.email
    WHERE u.role = 'user'
  `;

  const params = [];

  if (search) {
    query += " AND u.name LIKE ?";
    params.push(`%${search}%`);
  }

  if (blocked === "true") {
    query += " AND b.email IS NOT NULL";
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching customers" });
    }

    res.json(results);
  });
});

// delete customer

app.delete("/api/customers/:id", (req, res) => {
  connection.query(
    "DELETE FROM users WHERE id=? AND role='user'",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Delete failed" });
      }

      res.json({ message: "Customer deleted" });
    },
  );
});

// block and unblock customer
app.put("/api/customers/:id/block", (req, res) => {
  const { blocked } = req.body;

  // get user email first
  connection.query(
    "SELECT email FROM users WHERE id=?",
    [req.params.id],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(500).json({ message: "User not found" });
      }

      const email = result[0].email;

      if (blocked) {
        // BLOCK → insert into blocked_emails
        connection.query(
          "INSERT IGNORE INTO blocked_emails (email) VALUES (?)",
          [email],
          (err) => {
            if (err) return res.status(500).json({ message: "Block failed" });

            res.json({ message: "User blocked" });
          },
        );
      } else {
        // UNBLOCK → remove from table
        connection.query(
          "DELETE FROM blocked_emails WHERE email=?",
          [email],
          (err) => {
            if (err) return res.status(500).json({ message: "Unblock failed" });

            res.json({ message: "User unblocked" });
          },
        );
      }
    },
  );
});
// delete admin
app.delete("/api/admins/:id", authMiddleware, verifySuperAdmin, (req, res) => {
  connection.query(
    "DELETE FROM users WHERE id=? AND role='admin'",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Delete failed" });

      res.json({ message: "Admin deleted" });
    },
  );
});

// block admin
app.post("/api/admins/block/:id", authMiddleware, verifySuperAdmin, (req, res) => {
  const { email } = req.body;

  connection.query(
    "INSERT INTO blocked_emails (email) VALUES (?)",
    [email],
    (err) => {
      if (err) return res.status(500).json({ message: "Block failed" });

      res.json({ message: "Admin blocked" });
    },
  );
});

// unblock admin
app.delete(
  "/api/admins/unblock/:email",
  authMiddleware,
  verifySuperAdmin,
  (req, res) => {
    connection.query(
      "DELETE FROM blocked_emails WHERE email=?",
      [req.params.email],
      () => res.json({ message: "Admin unblocked" }),
    );
  },
);

// get admin with search + blocked status
app.get("/api/admins", authMiddleware, (req, res) => {
  const { search = "", blocked } = req.query;

  let query = `
    SELECT 
      users.id,
      users.name,
      users.email,
      users.role,
      CASE 
        WHEN blocked_emails.email IS NOT NULL THEN 1 
        ELSE 0 
      END AS blocked
    FROM users
    LEFT JOIN blocked_emails
      ON users.email = blocked_emails.email
    WHERE users.role IN ('admin','super_admin')
  `;

  const params = [];

  // 🔥 ROLE FILTER (STRICT)
  if (req.user.role === "admin") {
    query += " AND users.role = 'admin'";
  }

  // super_admin sees both admin + super_admin (no extra filter needed)

  if (search) {
    query += " AND users.name LIKE ?";
    params.push(`%${search}%`);
  }

  if (blocked === "true") {
    query += " AND blocked_emails.email IS NOT NULL";
  }

  connection.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching admins" });
    }

    res.json(result);
  });
});
// ================= ADD ADMIN (SUPER ADMIN ONLY) =================
app.post("/api/admins", authMiddleware, (req, res) => {
  // only super admin can create admins
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      message: "Only super admin can add admins",
    });
  }

  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  if (!["admin", "super_admin"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  // check if email exists
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (results.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
          INSERT INTO users (name, email, password, role)
          VALUES (?, ?, ?, ?)
        `;

        connection.query(
          sql,
          [name, email, hashedPassword, role],
          (err) => {
            if (err) {
              return res.status(500).json({ message: "Insert failed" });
            }

            res.json({ message: "Admin created successfully" });
          }
        );
      } catch (error) {
        res.status(500).json({ message: "Password error" });
      }
    }
  );
});