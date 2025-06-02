const express = require('express');
const multer = require('multer');
const path = require('path');
const { studentDB, employeeDB } = require('./db');

const app = express();

app.use(express.static('public'));  // Serve static files (HTML, CSS, JS, uploads)
app.use(express.urlencoded({ extended: true }));

// Setup multer storage for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');  // Upload folder inside 'public'
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + original file extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper function for LIKE search pattern
function getLikeSearch(search) {
  return `%${search.toLowerCase()}%`;
}

// API to get employee data with search filtering
app.get('/data/employee', (req, res) => {
  const search = req.query.search || '';
  const likeSearch = getLikeSearch(search);

  const sql = `
    SELECT * FROM employees 
    WHERE LOWER(name) LIKE ? 
       OR LOWER(department) LIKE ? 
       OR LOWER(contact) LIKE ? 
       OR CAST(id AS CHAR) LIKE ?`;

  employeeDB.query(sql, [likeSearch, likeSearch, likeSearch, likeSearch], (err, results) => {
    if (err) {
      console.error('Employee DB query error:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

// API to get student data with search filtering
app.get('/data/student', (req, res) => {
  const search = req.query.search || '';
  const likeSearch = getLikeSearch(search);

  const sql = `
    SELECT * FROM students 
    WHERE LOWER(name) LIKE ? 
       OR LOWER(department) LIKE ? 
       OR LOWER(contact) LIKE ? 
       OR CAST(id AS CHAR) LIKE ?`;

  studentDB.query(sql, [likeSearch, likeSearch, likeSearch, likeSearch], (err, results) => {
    if (err) {
      console.error('Student DB query error:', err);
      return res.status(500).json([]);
    }
    res.json(results);
  });
});

// Add entry to student or employee directory
app.post('/add', upload.single('photo'), (req, res) => {
  const { id, name, department, contact, directory } = req.body;
  const photo = req.file?.filename;

  if (!photo) {
    return res.status(400).send('Photo upload failed.');
  }

  let dbConn;
  let table;

  if (directory === 'employee') {
    dbConn = employeeDB;
    table = 'employees';
  } else if (directory === 'student') {
    dbConn = studentDB;
    table = 'students';
  } else {
    return res.status(400).send('Invalid directory specified.');
  }

  // Check if the ID already exists to prevent duplicates
  const checkSql = `SELECT id FROM ${table} WHERE id = ?`;
  dbConn.query(checkSql, [id], (err, results) => {
    if (err) {
      console.error('DB check error:', err);
      return res.status(500).send('Database error');
    }

    if (results.length > 0) {
      return res.status(400).send(`Entry with ID ${id} already exists.`);
    }

    // Insert new record
    const insertSql = `INSERT INTO ${table} (id, name, department, contact, photo) VALUES (?, ?, ?, ?, ?)`;
    dbConn.query(insertSql, [id, name, department, contact, photo], (err) => {
      if (err) {
        console.error('DB insert error:', err);
        return res.status(500).send('Database error');
      }
      // After successful insert, redirect back to main page or wherever you want
      res.redirect('/');
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
