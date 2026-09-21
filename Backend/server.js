const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
const { spawn } = require("child_process");
const validator = require("validator");
const fs = require("fs").promises;

dotenv.config();

const app = express();

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   DATABASE
========================================================= */

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
};

const pool = mysql.createPool(dbConfig);

const JWT_SECRET = process.env.JWT_SECRET;

/* =========================================================
   JWT
========================================================= */

const generateToken = (userId, email, role) => {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
};

/* =========================================================
   AUTHENTICATION
========================================================= */

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token has expired, please log in again",
      });
    }

    return res.status(401).json({
      message: "Token is not valid",
    });
  }
};

/* =========================================================
   COURSE HELPER
========================================================= */

const courseExists = async (courseId) => {
  const [rows] = await pool.query(
    "SELECT * FROM courses WHERE id = ?",
    [courseId]
  );

  return rows.length > 0;
};

/* =========================================================
   SIGNUP
========================================================= */

app.post("/signup", async (req, res) => {
  const {
    email,
    password,
    role,
    mobileNumber,
    professorEmail,
  } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Please provide email, password, and role",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email is already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let userStatus = "approved";

    if (role === "professor") {
      userStatus = "pending";
    }

    const query = `
      INSERT INTO users
      (
        email,
        password,
        role,
        mobile_number,
        professor_email,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      email,
      hashedPassword,
      role,
      mobileNumber || null,
      professorEmail || null,
      userStatus,
    ];

    const [result] = await pool.query(query, values);

    if (role === "professor") {
      return res.status(202).json({
        message:
          "Professor account created successfully, pending admin approval.",
      });
    }

    const token = generateToken(
      result.insertId,
      email,
      role
    );

    return res.status(201).json({
      message: "User created successfully",
      token,
    });
  } catch (error) {
    console.error("Error during signup:", error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

/* =========================================================
   LOGIN
========================================================= */

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide email and password",
    });
  }

  try {
    const [results] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = results[0];

    if (
      user.role === "professor" &&
      user.status !== "approved"
    ) {
      return res.status(403).json({
        message: `Your professor account is ${user.status}. Please wait for admin approval.`,
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    const token = generateToken(
      user.id,
      user.email,
      user.role
    );

    let professorId = null;
    let studentId = null;
    let enrolledCourses = [];
    let adminId = null;

    if (user.role === "admin") {
      adminId = user.id;
    } else if (user.role === "professor") {
      professorId = user.id;
    } else if (user.role === "student") {
      studentId = user.id;

      const [enrolledCoursesData] =
        await pool.query(
          `
          SELECT
            c.id,
            c.course_name,
            c.course_code
          FROM enrollments e
          JOIN courses c
            ON e.course_code = c.course_code
          WHERE e.user_id = ?
          `,
          [studentId]
        );

      enrolledCourses = enrolledCoursesData;
    }

    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      professorId,
      studentId,
      enrolledCourses,
      adminId,
    });
  } catch (error) {
    console.error("Error during login:", error);

    return res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
});

/* =========================================================
   ADD COURSE
========================================================= */

app.post(
  "/courses",
  authenticate,
  async (req, res) => {
    const {
      course_name,
      course_description,
      course_code,
      start_date,
      end_date,
    } = req.body;

    if (req.user.role !== "professor") {
      return res.status(403).json({
        message: "Only professors can add courses",
      });
    }

    if (
      !course_name ||
      !course_code ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        message:
          "Please provide all required fields (course_name, course_code, start_date, end_date)",
      });
    }

    if (
      !validator.isISO8601(start_date) ||
      !validator.isISO8601(end_date)
    ) {
      return res.status(400).json({
        message:
          "Invalid date format. Use ISO 8601 format.",
      });
    }

    try {
      const [result] = await pool.query(
        `
        INSERT INTO courses
        (
          course_name,
          course_description,
          course_code,
          professor_id,
          start_date,
          end_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          course_name,
          course_description,
          course_code,
          req.user.userId,
          start_date,
          end_date,
        ]
      );

      return res.status(201).json({
        message: "Course added successfully",
        courseId: result.insertId,
      });
    } catch (error) {
      console.error("Error adding course:", error);

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   MULTER
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    const fileExtension = path.extname(
      file.originalname
    );

    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        fileExtension
    );
  },
});

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDFs and videos are allowed."
        ),
        false
      );
    }
  },
});

/* =========================================================
   ADMIN AUTH
========================================================= */

function authenticateAdmin(req, res, next) {
  const token =
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        error:
          "Forbidden - Admin access required",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}

/* =========================================================
   ADD COURSE MATERIAL
========================================================= */

app.post(
  "/courses/:courseId/materials",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    const courseId = parseInt(
      req.params.courseId
    );

    const {
      material_name,
      material_description,
    } = req.body;

    const filePath = req.file
      ? req.file.path
      : null;

    let parsedTopics = [];

    try {
      parsedTopics = JSON.parse(
        req.body.topics || "[]"
      );
    } catch (error) {
      return res.status(400).json({
        message: "Invalid topics JSON",
      });
    }

    const videoLink =
      req.body.video_link || null;

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [materialResult] =
        await connection.query(
          `
          INSERT INTO materials
          (
            course_id,
            material_name,
            material_description,
            material_link,
            video_link
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            courseId,
            material_name,
            material_description,
            filePath,
            videoLink,
          ]
        );

      const materialId =
        materialResult.insertId;

      if (
        Array.isArray(parsedTopics) &&
        parsedTopics.length > 0
      ) {
        for (const topic of parsedTopics) {
          await connection.query(
            `
            INSERT INTO topics
            (
              material_id,
              topic_name,
              topic_content,
              written_code
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              materialId,
              topic.topicName,
              topic.topicContent,
              topic.writtenCode !== undefined
                ? topic.writtenCode
                : null,
            ]
          );
        }
      }

      await connection.commit();

      connection.release();

      return res.status(201).json({
        message:
          "Material added successfully",
        materialId,
      });
    } catch (error) {
      await connection.rollback();

      connection.release();

      console.error(
        "Database Error:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   ADD TOPICS
========================================================= */

app.post(
  "/materials/:materialId/topics",
  authenticate,
  async (req, res) => {
    const { materialId } =
      req.params;

    const topics = req.body;

    console.log(
      "Received materialId:",
      materialId
    );

    console.log(
      "Received topics:",
      topics
    );

    if (
      !Array.isArray(topics) ||
      topics.length === 0
    ) {
      return res.status(400).json({
        message:
          "No topics provided or topics is not an array.",
      });
    }

    for (const topic of topics) {
      if (
        !topic.topicName ||
        !topic.topicContent
      ) {
        return res.status(400).json({
          message:
            "Each topic must have a topicName and topicContent.",
        });
      }
    }

    try {
      const insertPromises =
        topics.map((topic) => {
          return pool.query(
            `
            INSERT INTO topics
            (
              material_id,
              topic_name,
              topic_content,
              written_code
            )
            VALUES (?, ?, ?, ?)
            `,
            [
              materialId,
              topic.topicName,
              topic.topicContent,
              topic.writtenCode || null,
            ]
          );
        });

      await Promise.all(
        insertPromises
      );

      return res.json({
        message:
          "Topics added successfully",
      });
    } catch (err) {
      console.error(
        "Error adding topics:",
        err
      );

      return res.status(500).json({
        message:
          "Failed to add topics.",
      });
    }
  }
);

/* =========================================================
   ENROLL COURSE
========================================================= */

app.post(
  "/courses/:courseCode/enroll",
  authenticate,
  async (req, res) => {
    const { courseCode } =
      req.params;

    const userId =
      req.user.userId;

    if (req.user.role !== "student") {
      return res.status(403).json({
        message:
          "Only students can enroll in courses",
      });
    }

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [courseRows] =
        await connection.query(
          `
          SELECT *
          FROM courses
          WHERE LOWER(course_code) = LOWER(?)
          `,
          [courseCode]
        );

      if (courseRows.length === 0) {
        await connection.rollback();

        connection.release();

        return res.status(404).json({
          message: "Course not found",
        });
      }

      const [
        existingEnrollment,
      ] = await connection.query(
        `
        SELECT *
        FROM enrollments
        WHERE user_id = ?
        AND LOWER(course_code) = LOWER(?)
        `,
        [userId, courseCode]
      );

      if (
        existingEnrollment.length > 0
      ) {
        await connection.rollback();

        connection.release();

        return res.status(400).json({
          message:
            "You are already enrolled in this course",
        });
      }

      await connection.query(
        `
        INSERT INTO enrollments
        (
          user_id,
          course_code
        )
        VALUES (?, ?)
        `,
        [userId, courseCode]
      );

      await connection.commit();

      connection.release();

      return res.status(201).json({
        message:
          "Successfully enrolled in the course",
      });
    } catch (error) {
      await connection.rollback();

      connection.release();

      console.error(
        "Error enrolling student:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   PROCESS IMAGE
========================================================= */

app.post(
  "/process-image",
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message:
          "No image file uploaded.",
      });
    }

    const imagePath = path.join(
      __dirname,
      req.file.path
    );

    const python = spawn("python3", [
  path.join(__dirname, "process_image.py"),
  imagePath,
]);

    let output = "";
    let errorOutput = "";

    python.stdout.on(
      "data",
      (data) => {
        output += data.toString();
      }
    );

    python.stderr.on(
      "data",
      (data) => {
        errorOutput +=
          data.toString();

        console.error(
          `Python Error: ${data}`
        );
      }
    );

    python.on(
      "close",
      (code) => {
        if (code === 0) {
          try {
            const jsonResponse =
              JSON.parse(output);

            return res.json({
              message:
                "Image processed successfully!",
              output_path:
                jsonResponse.output_path,
            });
          } catch (error) {
            console.error(
              "Error parsing Python output:",
              error
            );

            return res.status(500).json({
              error:
                "Error parsing Python output",
            });
          }
        }

        console.error(
          "Python script failed:",
          {
            code,
            output,
            stderr: errorOutput,
          }
        );

        return res.status(500).json({
          error:
            "Python script failed",
          output,
          stderr: errorOutput,
        });
      }
    );
  }
);

/* =========================================================
   ADD ASSIGNMENT
========================================================= */

app.post(
  "/courses/:courseCode/assignments",
  authenticate,
  upload.single("pdf"),
  async (req, res) => {
    const { courseCode } =
      req.params;

    const {
      title,
      description,
      due_date,
    } = req.body;

    const pdfPath = req.file
      ? req.file.path
      : null;

    try {
      if (
        !title ||
        !description ||
        !due_date ||
        !courseCode
      ) {
        return res.status(400).json({
          message:
            "Missing required fields",
        });
      }

      const [courseRows] =
        await pool.query(
          `
          SELECT id
          FROM courses
          WHERE course_code = ?
          `,
          [courseCode]
        );

      if (courseRows.length === 0) {
        return res.status(404).json({
          message:
            "Course not found",
        });
      }

      const courseId =
        courseRows[0].id;

      const [result] =
        await pool.query(
          `
          INSERT INTO assignments
          (
            course_id,
            title,
            description,
            due_date,
            pdf_path
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            courseId,
            title,
            description,
            due_date,
            pdfPath,
          ]
        );

      return res.status(201).json({
        message:
          "Assignment added successfully",
        assignmentId:
          result.insertId,
      });
    } catch (error) {
      console.error(
        "Error adding assignment:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to add assignment",
      });
    }
  }
);

/* =========================================================
   GET USERS
========================================================= */

app.get(
  "/users",
  async (req, res) => {
    try {
      const token =
        req.headers.authorization?.split(
          " "
        )[1];

      if (!token) {
        return res.status(401).json({
          message:
            "Authentication token missing.",
        });
      }

      const [users] =
        await pool.query(
          `
          SELECT
            id,
            email,
            role,
            mobile_number,
            professor_email,
            created_at,
            status
          FROM users
          `
        );

      const formattedUsers =
        users.map((user) => ({
          ...user,

          created_at:
            user.created_at
              ? new Date(
                  user.created_at
                ).toISOString()
              : null,
        }));

      return res.status(200).json(
        formattedUsers
      );
    } catch (error) {
      console.error(
        "Error fetching users:",
        error
      );

      return res.status(500).json({
        error:
          error.message ||
          "Failed to fetch users.",
      });
    }
  }
);

/* =========================================================
   GET COURSES
========================================================= */

app.get(
  "/courses",
  async (req, res) => {
    try {
      const [rows] =
        await pool.query(
          "SELECT * FROM courses"
        );

      return res.json(rows);
    } catch (error) {
      console.error(
        "Error fetching courses:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET PROFESSOR COURSES
========================================================= */

app.get(
  "/courses/professor",
  authenticate,
  async (req, res) => {
    if (req.user.role !== "professor") {
      return res.status(403).json({
        message:
          "Only professors can view their courses",
      });
    }

    try {
      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM courses
          WHERE professor_id = ?
          `,
          [req.user.userId]
        );

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "No courses found for this professor",
        });
      }

      return res.json(rows);
    } catch (error) {
      console.error(
        "Error fetching professor courses:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET COURSE BY ID
========================================================= */

app.get(
  "/courses/:id",
  async (req, res) => {
    const courseId =
      req.params.id;

    try {
      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM courses
          WHERE id = ?
          `,
          [courseId]
        );

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "Course not found",
        });
      }

      return res.json(rows[0]);
    } catch (error) {
      console.error(
        "Error fetching course by ID:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET COURSE MATERIALS
========================================================= */

app.get(
  "/courses/:id/materials",
  async (req, res) => {
    const courseId =
      req.params.id;

    try {
      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM materials
          WHERE course_id = ?
          `,
          [courseId]
        );

      return res.json(rows);
    } catch (error) {
      console.error(
        "Error fetching materials:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET MATERIAL
========================================================= */

app.get(
  "/materials/:materialId",
  async (req, res) => {
    const materialId =
      req.params.materialId;

    try {
      const [results] =
        await pool.query(
          `
          SELECT *
          FROM materials
          WHERE id = ?
          `,
          [materialId]
        );

      if (results.length === 0) {
        return res.status(404).json({
          message:
            "Material not found",
        });
      }

      return res.json(
        results[0]
      );
    } catch (error) {
      console.error(
        "Error fetching material:",
        error
      );

      return res.status(500).json({
        error:
          "Internal Server Error",
      });
    }
  }
);

/* =========================================================
   GET MATERIAL TOPICS
========================================================= */

app.get(
  "/materials/:materialId/topics",
  async (req, res) => {
    const materialId =
      req.params.materialId;

    try {
      const [results] =
        await pool.query(
          `
          SELECT *
          FROM topics
          WHERE material_id = ?
          `,
          [materialId]
        );

      return res.json(results);
    } catch (error) {
      console.error(
        "Error fetching topics:",
        error
      );

      return res.status(500).json({
        error:
          "Internal Server Error",
      });
    }
  }
);

/* =========================================================
   GET USER ENROLLMENTS
========================================================= */

app.get(
  "/users/:userId/enrollments",
  async (req, res) => {
    const { userId } =
      req.params;

    try {
      const [rows] =
        await pool.query(
          `
          SELECT
            c.id,
            c.course_code,
            c.course_name,
            c.course_description
          FROM enrollments AS e
          JOIN courses AS c
            ON LOWER(e.course_code)
            = LOWER(c.course_code)
          WHERE e.user_id = ?
          `,
          [userId]
        );

      return res.json(rows);
    } catch (error) {
      console.error(
        "Error fetching enrollments:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   CHECK ENROLLMENT
========================================================= */

app.get(
  "/enrollments/:courseCode",
  authenticate,
  async (req, res) => {
    const { courseCode } =
      req.params;

    const userId =
      req.user.userId;

    try {
      const [
        existingEnrollment,
      ] = await pool.query(
        `
        SELECT *
        FROM enrollments
        WHERE user_id = ?
        AND course_code = ?
        `,
        [userId, courseCode]
      );

      const [course] =
        await pool.query(
          `
          SELECT professor_id
          FROM courses
          WHERE course_code = ?
          `,
          [courseCode]
        );

      if (
        existingEnrollment.length >
          0 ||
        (
          course.length > 0 &&
          course[0].professor_id ===
            userId
        )
      ) {
        return res.status(200).json({
          enrolled: true,
        });
      }

      return res.status(404).json({
        enrolled: false,
      });
    } catch (error) {
      console.error(
        "Error checking enrollment:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET COURSE ENROLLMENTS
========================================================= */

app.get(
  "/courses/:courseCode/enrollments",
  authenticate,
  async (req, res) => {
    const { courseCode } =
      req.params;

    try {
      const [rows] =
        await pool.query(
          `
          SELECT
            u.id,
            u.email,
            u.role
          FROM enrollments e
          JOIN users u
            ON e.user_id = u.id
          WHERE e.course_code = ?
          `,
          [courseCode]
        );

      return res.json(rows);
    } catch (error) {
      console.error(
        "Error fetching enrollments:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET PROFESSOR COURSES BY USER ID
========================================================= */

app.get(
  "/users/:professorId/courses",
  authenticate,
  async (req, res) => {
    const professorId =
      req.params.professorId;

    if (req.user.role !== "professor") {
      return res.status(403).json({
        message:
          "Only professors can view their courses",
      });
    }

    try {
      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM courses
          WHERE professor_id = ?
          `,
          [professorId]
        );

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "No courses found for this professor",
        });
      }

      return res.json(rows);
    } catch (error) {
      console.error(
        "Error fetching professor courses:",
        error
      );

      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET ASSIGNMENTS
========================================================= */

app.get(
  "/courses/:courseId/assignments",
  async (req, res) => {
    try {
      const { courseId } =
        req.params;

      const [rows] =
        await pool.query(
          `
          SELECT *
          FROM assignments
          WHERE course_id = ?
          `,
          [courseId]
        );

      return res.json(rows);
    } catch (error) {
      console.error(
        "Error fetching assignments:",
        error
      );

      return res.status(500).json({
        error:
          "Internal Server Error",
      });
    }
  }
);

/* =========================================================
   PENDING PROFESSORS
========================================================= */

app.get(
  "/admin/professors/pending",
  authenticateAdmin,
  async (req, res) => {
    try {
      const [professors] =
        await pool.query(
          `
          SELECT
            id,
            email,
            mobile_number,
            professor_email,
            created_at
          FROM users
          WHERE role = 'professor'
          AND status = 'pending'
          `
        );

      const formattedProfessors =
        professors.map(
          (prof) => ({
            ...prof,

            created_at:
              new Date(
                prof.created_at
              ).toISOString(),
          })
        );

      return res.json(
        formattedProfessors
      );
    } catch (err) {
      console.error(
        "Error fetching pending professors:",
        err
      );

      return res.status(500).json({
        error:
          "Internal server error",
      });
    }
  }
);

/* =========================================================
   APPROVE PROFESSOR
========================================================= */

app.put(
  "/admin/professors/:id/approve",
  authenticateAdmin,
  async (req, res) => {
    const { id } =
      req.params;

    try {
      const [result] =
        await pool.query(
          `
          UPDATE users
          SET status = 'approved'
          WHERE id = ?
          AND role = 'professor'
          AND status = 'pending'
          `,
          [id]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          message:
            "Professor not found or not in pending status",
        });
      }

      return res.json({
        message:
          "Professor account approved successfully",
      });
    } catch (err) {
      console.error(
        "Error approving professor:",
        err
      );

      return res.status(500).json({
        error:
          "Internal server error",
      });
    }
  }
);

/* =========================================================
   REJECT PROFESSOR
========================================================= */

app.put(
  "/admin/professors/:id/reject",
  authenticateAdmin,
  async (req, res) => {
    const { id } =
      req.params;

    try {
      const [result] =
        await pool.query(
          `
          UPDATE users
          SET status = 'rejected'
          WHERE id = ?
          AND role = 'professor'
          AND status = 'pending'
          `,
          [id]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          message:
            "Professor not found or not in pending status",
        });
      }

      return res.json({
        message:
          "Professor account rejected successfully",
      });
    } catch (err) {
      console.error(
        "Error rejecting professor:",
        err
      );

      return res.status(500).json({
        error:
          "Internal server error",
      });
    }
  }
);

/* =========================================================
   DELETE COURSE
========================================================= */

app.delete(
  "/courses/:id",
  authenticate,
  async (req, res) => {
    const courseId =
      req.params.id;

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [courseRows] =
        await connection.query(
          `
          SELECT professor_id
          FROM courses
          WHERE id = ?
          `,
          [courseId]
        );

      if (courseRows.length === 0) {
        await connection.rollback();

        connection.release();

        return res.status(404).json({
          message:
            "Course not found",
        });
      }

      const courseProfessorId =
        courseRows[0].professor_id;

      if (
        courseProfessorId !==
          req.user.userId &&
        req.user.role !== "admin"
      ) {
        await connection.rollback();

        connection.release();

        return res.status(403).json({
          message:
            "You are not authorized to delete this course",
        });
      }

      await connection.query(
        `
        DELETE FROM topics
        WHERE material_id IN
        (
          SELECT id
          FROM materials
          WHERE course_id = ?
        )
        `,
        [courseId]
      );

      await connection.query(
        `
        DELETE FROM materials
        WHERE course_id = ?
        `,
        [courseId]
      );

      const [deleteResult] =
        await connection.query(
          `
          DELETE FROM courses
          WHERE id = ?
          `,
          [courseId]
        );

      await connection.commit();

      connection.release();

      if (
        deleteResult.affectedRows ===
        0
      ) {
        return res.status(404).json({
          message:
            "Course already deleted or not found",
        });
      }

      return res.status(200).json({
        message:
          "Course deleted successfully",
      });
    } catch (error) {
      console.error(
        "Error deleting course:",
        error
      );

      await connection.rollback();

      connection.release();

      return res.status(500).json({
        message:
          "Error deleting course",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   DELETE MATERIAL
========================================================= */

app.delete(
  "/materials/:materialId",
  authenticate,
  async (req, res) => {
    const materialId =
      req.params.materialId;

    if (req.user.role !== "professor") {
      return res.status(403).json({
        message:
          "Only professors can delete materials",
      });
    }

    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [materialRows] =
        await connection.query(
          `
          SELECT material_link
          FROM materials
          WHERE id = ?
          `,
          [materialId]
        );

      if (materialRows.length === 0) {
        await connection.rollback();

        connection.release();

        return res.status(404).json({
          message:
            "Material not found",
        });
      }

      const materialLink =
        materialRows[0]
          .material_link;

      await connection.query(
        `
        DELETE FROM topics
        WHERE material_id = ?
        `,
        [materialId]
      );

      await connection.query(
        `
        DELETE FROM materials
        WHERE id = ?
        `,
        [materialId]
      );

      await connection.commit();

      connection.release();

      if (materialLink) {
        try {
          await fs.unlink(
            materialLink
          );
        } catch (fileError) {
          console.error(
            "Error deleting material file:",
            fileError
          );
        }
      }

      return res.status(200).json({
        message:
          "Material deleted successfully",
      });
    } catch (error) {
      console.error(
        "Error deleting material:",
        error
      );

      await connection.rollback();

      connection.release();

      return res.status(500).json({
        message:
          "Error deleting material",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   EXECUTE CODE
========================================================= */

app.post(
  "/execute-code",
  authenticate,
  async (req, res) => {
    let codePath = null;
    let pythonProcess = null;
    let timeout = null;

    try {
      const {
        code,
        language,
      } = req.body;

      /* -------------------------
         VALIDATION
      ------------------------- */

      if (
        !code ||
        !code.trim()
      ) {
        return res.status(400).json({
          error:
            "Code cannot be empty",
        });
      }

      if (language !== "python") {
        return res.status(400).json({
          error:
            "Currently only Python is supported",
        });
      }

      /* -------------------------
         UNIQUE FILE
      ------------------------- */

      const fileName =
        `code-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}.py`;

      codePath = path.join(
        __dirname,
        fileName
      );

      await fs.writeFile(
        codePath,
        code,
        "utf8"
      );

      /* -------------------------
         RUN PYTHON
      ------------------------- */

      pythonProcess = spawn(
        "python3",
        [codePath]
      );

      let output = "";
      let errorOutput = "";

      pythonProcess.stdout.on(
        "data",
        (data) => {
          output +=
            data.toString();

          // Prevent huge output
          if (
            output.length >
            100000
          ) {
            pythonProcess.kill(
              "SIGKILL"
            );
          }
        }
      );

      pythonProcess.stderr.on(
        "data",
        (data) => {
          errorOutput +=
            data.toString();

          if (
            errorOutput.length >
            100000
          ) {
            pythonProcess.kill(
              "SIGKILL"
            );
          }
        }
      );

      /* -------------------------
         TIMEOUT
      ------------------------- */

      timeout = setTimeout(() => {
        if (
          pythonProcess &&
          !pythonProcess.killed
        ) {
          pythonProcess.kill(
            "SIGKILL"
          );
        }
      }, 5000);

      /* -------------------------
         PROCESS CLOSE
      ------------------------- */

      pythonProcess.on(
        "close",
        async (closeCode) => {
          if (timeout) {
            clearTimeout(timeout);
          }

          /* Delete temp file */

          try {
            if (codePath) {
              await fs.unlink(
                codePath
              );
            }
          } catch (deleteError) {
            console.error(
              "Error deleting temporary file:",
              deleteError
            );
          }

          /* Timeout */

          if (
            closeCode === null
          ) {
            return res.status(408).json({
              error:
                "Execution timed out. Maximum execution time is 5 seconds.",
            });
          }

          /* Python error */

          if (
            closeCode !== 0
          ) {
            return res.status(400).json({
              error:
                "Code execution failed",
              stderr:
                errorOutput,
            });
          }

          /* Success */

          return res.status(200).json({
            output,
          });
        }
      );

      /* -------------------------
         PROCESS ERROR
      ------------------------- */

      pythonProcess.on(
        "error",
        async (error) => {
          if (timeout) {
            clearTimeout(timeout);
          }

          try {
            if (codePath) {
              await fs.unlink(
                codePath
              );
            }
          } catch (deleteError) {
            // File may already be deleted
          }

          console.error(
            "Python process error:",
            error
          );

          if (!res.headersSent) {
            return res
              .status(500)
              .json({
                error:
                  "Failed to start Python interpreter",
              });
          }
        }
      );
    } catch (error) {
      if (timeout) {
        clearTimeout(timeout);
      }

      console.error(
        "Execute Code Error:",
        error
      );

      if (codePath) {
        try {
          await fs.unlink(
            codePath
          );
        } catch (deleteError) {
          // File may already be deleted
        }
      }

      if (!res.headersSent) {
        return res.status(500).json({
          error:
            "Internal server error",
        });
      }
    }
  }
);

/* =========================================================
   DELETE USER
========================================================= */

app.delete(
  "/users/:userId",
  authenticateAdmin,
  async (req, res) => {
    try {
      const userId =
        req.params.userId;

      if (
        String(userId) ===
        String(req.user.userId)
      ) {
        return res.status(400).json({
          error:
            "You cannot delete your own account",
        });
      }

      const [result] =
        await pool.query(
          `
          DELETE FROM users
          WHERE id = ?
          `,
          [userId]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          error:
            "User not found",
        });
      }

      return res.json({
        message:
          "User deleted successfully",
      });
    } catch (err) {
      console.error(
        "Error deleting user:",
        err
      );

      return res.status(500).json({
        error:
          "Internal server error",
      });
    }
  }
);

/* =========================================================
   DELETE ASSIGNMENT
========================================================= */

app.delete(
  "/assignments/:assignmentId",
  authenticate,
  async (req, res) => {
    const assignmentId =
      req.params.assignmentId;

    try {
      const [assignmentRows] =
        await pool.query(
          `
          SELECT
            course_id,
            pdf_path
          FROM assignments
          WHERE id = ?
          `,
          [assignmentId]
        );

      if (
        assignmentRows.length === 0
      ) {
        return res.status(404).json({
          message:
            "Assignment not found",
        });
      }

      const courseId =
        assignmentRows[0].course_id;

      const pdfPath =
        assignmentRows[0].pdf_path;

      const [courseRows] =
        await pool.query(
          `
          SELECT professor_id
          FROM courses
          WHERE id = ?
          `,
          [courseId]
        );

      if (
        courseRows.length === 0
      ) {
        return res.status(404).json({
          message:
            "Course not found",
        });
      }

      const professorId =
        courseRows[0].professor_id;

      if (
        req.user.role !== "admin" &&
        req.user.userId !==
          professorId
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to delete this assignment",
        });
      }

      const [deleteResult] =
        await pool.query(
          `
          DELETE FROM assignments
          WHERE id = ?
          `,
          [assignmentId]
        );

      if (
        deleteResult.affectedRows ===
        0
      ) {
        return res.status(404).json({
          message:
            "Assignment already deleted or not found",
        });
      }

      if (pdfPath) {
        try {
          await fs.unlink(
            pdfPath
          );
        } catch (error) {
          console.error(
            "Error deleting PDF:",
            error
          );
        }
      }

      return res.status(200).json({
        message:
          "Assignment deleted successfully",
      });
    } catch (error) {
      console.error(
        "Error deleting assignment:",
        error
      );

      return res.status(500).json({
        error:
          "Internal Server Error",
      });
    }
  }
);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "E-Learning API is running",
      status: "OK",
    });
  }
);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
  (err, req, res, next) => {
    console.error(
      "Unhandled Error:",
      err
    );

    return res.status(500).json({
      error:
        err.message ||
        "Internal Server Error",
    });
  }
);

/* =========================================================
   SERVER
========================================================= */

const PORT =
  process.env.PORT || 8081;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});