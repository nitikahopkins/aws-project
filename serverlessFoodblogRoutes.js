// const express = require("express");
// const serverless = require("serverless-http");
// const cors = require("cors");
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

const express = require("express");
const sql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const serverless = require("serverless-http");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const { DB_HOST, DB_USER, DB_PASSWORD } = require("./creds");

const pool = sql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
});

app.post("/user", async (request, response) => {
  try {
    console.log("POST USER");
    if (!request.body.username) {
      response.status(400).send({ message: "no username entered" });
    }
    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `INSERT INTO foodblog.user (username, profilepic, bio) VALUES (?, ?, ?)`,
      [
        request.body.username,
        request.body.profilepic ? request.body.profilepic : null,
        request.body.bio ? request.body.bio : null,
      ]
    );
    conn.release();
    console.log(queryResponse);
    response.status(200).send({ message: queryResponse });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.get("/users", authorizeUser, async (request, response) => {
  try {
    console.log("GET ALL USERS");

    const conn = await pool.getConnection();
    const recordset = await conn.query(`SELECT * FROM foodblog.user`);
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.get("/user", authorizeUser, async (request, response) => {
  try {
    console.log("GET ONE USERS");

    const conn = await pool.getConnection();
    const recordset = await conn.execute(
      `SELECT * FROM foodblog.user WHERE username = ?`,
      [request.query.username]
    );
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.put("/user", authorizeUser, async (request, response) => {
  try {
    console.log("UPDATE USER");
    if (!request.body.username) {
      response.status(400).send({ message: "no username entered" });
    }

    const selectQuery = await pool.execute(
      `SELECT * from foodblog.user WHERE username = ?`,
      [request.body.username]
    );
    console.log(selectQuery[0][0]);
    const selectedUser = selectQuery[0][0];

    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `UPDATE foodblog.user SET username = ?, profilepic = ?, bio = ? WHERE username = ?`,
      [
        request.body.username,
        request.body.profilepic
          ? request.body.profilepic
          : selectedUser.profilepic,
        request.body.bio ? request.body.bio : selectedUser.bio,
        request.body.username,
      ]
    );
    conn.release();
    console.log(queryResponse);
    response.status(200).send({ message: queryResponse });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.delete("/user", authorizeUser, async (request, response) => {
  try {
    console.log("DELETE ONE USER");

    const conn = await pool.getConnection();
    const recordset = await conn.execute(
      `DELETE FROM foodblog.user WHERE username = ?`,
      [request.body.username]
    );
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.post("/foodblogpost", async (request, response) => {
  try {
    console.log("POST FOOD BLOGPOST");
    if (!request.body.username) {
      response.status(400).send({ message: "this blogpost has no user" });
    }
    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `INSERT INTO foodblog.foodblogpost (username, title, description, date) VALUES (?, ?, ?, ?)`,
      [
        request.body.username,
        request.body.title ? request.body.title : null,
        request.body.description ? request.body.description : null,
        new Date(),
      ]
    );
    conn.release();
    console.log(queryResponse);
    response.status(200).send({ message: queryResponse });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.get("/foodblogposts", authorizeUser, async (request, response) => {
  try {
    console.log("GET ALL POSTS");

    const conn = await pool.getConnection();
    const recordset = await conn.query(
      // `SELECT * FROM foodblog.user users JOIN foodblog.foodblogpost foodposts ON users.username = foodposts.username`
      // `SELECT date,bio,users.username FROM foodblog.user users JOIN foodblog.foodblogpost foodposts ON users.username = foodposts.username`
      `SELECT * FROM foodblog.foodblogpost`
    );
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.get("/foodblogpost", authorizeUser, async (request, response) => {
  try {
    console.log("GET ONE POST");

    const conn = await pool.getConnection();
    const recordset = await conn.execute(
      `SELECT * FROM foodblog.foodblogpost WHERE id = ?`,
      [request.query.blogPostID]
    );
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.put("/foodblogpost", async (request, response) => {
  try {
    console.log("UPDATE POST");
    if (!request.body.blogPostId) {
      response.status(400).send({ message: "no valid blog id entered" });
    }

    const selectQuery = await pool.execute(
      `SELECT * from foodblog.foodblogpost WHERE id = ?`,
      [request.body.blogPostId]
    );
    console.log(selectQuery[0][0]);
    const selectedBlogPost = selectQuery[0][0];

    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `UPDATE foodblog.foodblogpost SET date = ?, title = ?, description = ? WHERE id = ?`,
      [
        new Date(),
        request.body.title ? request.body.title : selectedBlogPost.title,
        request.body.description
          ? request.body.description
          : selectedBlogPost.description,
        request.body.blogPostId,
      ]
    );
    conn.release();
    console.log(queryResponse);
    response.status(200).send({ message: queryResponse });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.delete("/foodblogpost", authorizeUser, async (request, response) => {
  try {
    console.log("DELETE ONE POST");

    const conn = await pool.getConnection();
    const recordset = await conn.execute(
      `DELETE FROM foodblog.foodblogpost WHERE id = ?`,
      [request.body.blogPostID]
    );
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.post("/foodblogpic", async (request, response) => {
  try {
    console.log("POST FOOD PIC");
    if (!request.body.s3uuid || !request.body.foodblogpost) {
      response.status(400).send({ message: "this blogpic is missing params" });
    }
    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `INSERT INTO foodblog.foodblogpic (s3uuid, description, foodblogpost) VALUES (?, ?, ?)`,
      [
        request.body.s3uuid,
        request.body.description ? request.body.description : null,
        request.body.foodblogpost,
      ]
    );
    conn.release();
    console.log(queryResponse);
    response.status(200).send({ message: queryResponse });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.get("/foodblogpics", async (request, response) => {
  try {
    console.log("GET ALL PICS");

    const conn = await pool.getConnection();
    const recordset = await conn.query(`SELECT * FROM foodblog.foodblogpic`);
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.get("/foodblogpic", authorizeUser, async (request, response) => {
  try {
    console.log("GET ONE PIC");

    const conn = await pool.getConnection();
    const recordset = await conn.execute(
      `SELECT * FROM foodblog.foodblogpost WHERE id = ?`,
      [request.query.blogPostID]
    );
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.put("/foodblogpic", authorizeUser, async (request, response) => {
  try {
    console.log("UPDATE ONE PIC");
    if (!request.body.s3uuid || !request.body.foodblogpost) {
      response.status(400).send({ message: "no valid  id entered" });
    }

    const selectQuery = await pool.execute(
      `SELECT * from foodblog.foodblogpic WHERE s3uuid = ? AND foodblogpost = ?`,
      [request.body.s3uuid, request.body.foodblogpost]
    );
    console.log(selectQuery[0][0]);
    const selectedUser = selectQuery[0][0];

    const conn = await pool.getConnection();
    const queryResponse = await conn.execute(
      `UPDATE foodblog.foodblogpic SET s3uuid = ?, description = ? WHERE foodblogpost = ? `,
      [
        request.body.s3uuid ? request.body.s3uuid : selectedUser.s3uuid,
        request.body.description ? request.body.description : null,
        request.body.foodblogpost,
      ]
    );
    conn.release();
    console.log(queryResponse);
    response.status(200).send({ message: queryResponse });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

app.delete("/foodblogpic", authorizeUser, async (request, response) => {
  try {
    console.log("DELETE ONE PIC");

    const conn = await pool.getConnection();
    const recordset = await conn.execute(
      `DELETE FROM foodblog.foodblogpic WHERE s3uuid = ?`,
      [request.body.s3uuid]
    );
    conn.release();
    console.log(recordset[0]);
    response.status(200).send({ message: recordset[0] });
  } catch (error) {
    console.log(error);
    response.status(500).send({ message: error });
  }
});

function authorizeUser(request, response, next) {
  console.log(request.query.secret);
  if (request.query.secret != "supersecret") {
    return response.status(403).send("");
  }
  next();
}

module.exports.handler = serverless(app);
