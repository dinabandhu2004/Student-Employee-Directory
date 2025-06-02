const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const studentDB = mysql.createConnection({
  host: process.env.STUDENT_DB_HOST,
  user: process.env.STUDENT_DB_USER,
  password: process.env.STUDENT_DB_PASS,
  database: process.env.STUDENT_DB_NAME,
});

const employeeDB = mysql.createConnection({
  host: process.env.EMPLOYEE_DB_HOST,
  user: process.env.EMPLOYEE_DB_USER,
  password: process.env.EMPLOYEE_DB_PASS,
  database: process.env.EMPLOYEE_DB_NAME,
});

studentDB.connect(err => {
  if (err) throw err;
  console.log('Connected to Student DB');
});

employeeDB.connect(err => {
  if (err) throw err;
  console.log('Connected to Employee DB');
});

module.exports = { studentDB, employeeDB };
