require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const app = express();
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

// create mysql pool for multiple connections
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "surya-agencies",
  multipleStatements: true,
});
const getEmployees = (req, res) => {
  // limit as 20
  const limit = req.query.limit;
  // page number
  const page = req.query.page;
  // calculate offset
  const offset = (page - 1) * limit;
  // query for fetching data with page number and offset
  const empQuery =
    "select * from Employee limit " + limit + " OFFSET " + offset;
  pool.getConnection(function (err, connection) {
    connection.query(empQuery, function (error, results, fields) {
      // When done with the connection, release it.
      connection.release();
      if (error) throw error;
      // create payload
      var jsonResult = {
        employee_page_count: results.length,
        page_number: page,
        employees: results,
      };
      // create response
      var myJsonString = JSON.parse(JSON.stringify(jsonResult));
      res.statusMessage = "Employee for page " + page;
      res.statusCode = 200;
      res.json(myJsonString);
      res.end();
    });
  });
};

const getEmployee = (req, res) => {
  const prodsQuery = "select * from Employee where empId=" + req.query.empId;
  pool.getConnection(function (err, connection) {
    connection.query(prodsQuery, function (error, results, fields) {
      // When done with the connection, release it.
      connection.release();
      if (error) throw error;
      // create response
      var myJsonString = JSON.parse(JSON.stringify(results));

      res.statusCode = 200;
      res.json(myJsonString);
      res.end();
    });
  });
};

const port = process.env.PORT || 3000;
app.get("/getEmployees", getEmployees);
app.get("/getEmployee", getEmployee);
app.listen(port, (err) => {
  if (err) console.log("Unable to start the server!");
  else console.log("Server started running on : " + port);
});
