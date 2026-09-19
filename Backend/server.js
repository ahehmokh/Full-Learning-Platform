const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { spawn } = require("child_process");
const { exec } = require('child_process');
const validator = require("validator");
const fs = require("fs").promises;

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
};

const pool = mysql.createPool(dbConfig);
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "1h" });
};

const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token has expired, please log in again" });
    }
    return res.status(401).json({ message: "Token is not valid" });
  }
};

const courseExists = async (courseId) => {
  const [rows] = await pool.query("SELECT * FROM courses WHERE id = ?", [
    courseId,
  ]);
  return rows.length > 0;
};

app.post("/signup", async (req, res) => {
  const { email, password, role, mobileNumber, professorEmail } = req.body; // mobileNumber and professorEmail are destructured here

  try {
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Please provide email, password, and role" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let query;
    let values;
    let userStatus = "approved"; // Default for students and admins

    if (role === "professor") {
      userStatus = "pending"; // Professors need approval
      // CORRECTED: Include mobile_number and professor_email in the INSERT query for professors
      query = "INSERT INTO users (email, password, role, mobile_number, professor_email, status) VALUES (?, ?, ?, ?, ?, ?)";
      values = [
        email,
        hashedPassword,
        role,
        mobileNumber || null, // Ensure these are passed, use null if undefined
        professorEmail || null, // Ensure these are passed, use null if undefined
        userStatus
      ];
    } else {
      // For 'student' and 'admin' roles, they are active immediately.
      // These fields are optionally stored for other roles if sent, otherwise null.
      query = "INSERT INTO users (email, password, role, mobile_number, professor_email, status) VALUES (?, ?, ?, ?, ?, ?)";
      values = [
        email,
        hashedPassword,
        role,
        mobileNumber || null,
        professorEmail || null,
        userStatus,
      ];
    }

    const [result] = await pool.query(query, values);

    // No token is generated for pending professors until approved
    if (role === "professor" && userStatus === "pending") {
      return res.status(202).json({
        message: "Professor account created successfully, pending admin approval.",
      });
    }

    const token = generateToken(result.insertId, email, role);
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    const [results] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    // --- NEW: Check professor status for login ---
    if (user.role === "professor" && user.status !== "approved") {
      return res.status(403).json({
        message: `Your professor account is ${user.status}. Please wait for admin approval.`,
      });
    }
    // --- END NEW ---

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = generateToken(user.id, user.email, user.role);

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
      const [enrolledCoursesData] = await pool.query(
        "SELECT c.id, c.course_name, c.course_code FROM enrollments e JOIN courses c ON e.course_code = c.course_code WHERE e.user_id = ?",
        [studentId]
      );
      enrolledCourses = enrolledCoursesData;
    }

    res.status(200).json({
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
    res.status(500).json({ message: "Error during login", error: error.message });
  }
});

app.post("/courses", authenticate, async (req, res) => {
  const { course_name, course_description, course_code, start_date, end_date } =
    req.body;

  if (req.user.role !== "professor") {
    return res.status(403).json({ message: "Only professors can add courses" });
  }

  if (!course_name || !course_code || !start_date || !end_date) {
    return res.status(400).json({
      message:
        "Please provide all required fields (course_name, course_code, start_date, end_date)",
    });
  }

  if (!validator.isISO8601(start_date) || !validator.isISO8601(end_date)) {
    return res
      .status(400)
      .json({ message: "Invalid date format. Use ISO 8601 format." });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO courses (course_name, course_description, course_code, professor_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
      [
        course_name,
        course_description,
        course_code,
        req.user.userId,
        start_date,
        end_date,
      ]
    );

    res.status(201).json({
      message: "Course added successfully",
      courseId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: error.message });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "application/pdf" ||
            file.mimetype.startsWith("video/") // Allow any video type
        ) {
            cb(null, true);
        } else {
            cb(
                new Error("Invalid file type. Only PDFs and videos are allowed."),
                false
            );
        }
    },
});

// Middleware to check admin status
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post(
    "/courses/:courseId/materials",
    authenticate,
    upload.single("file"),
    async (req, res) => {
      const courseId = parseInt(req.params.courseId);
      const { material_name, material_description } = req.body;
      const filePath = req.file ? req.file.path : null;
      const fileType = req.file ? req.file.mimetype.split("/")[0] : null;
      const parsedTopics = JSON.parse(req.body.topics || "[]");
      let videoLink = req.body.video_link || null;
  
      const connection = await pool.getConnection();
  
      try {
        await connection.beginTransaction();
  
  
        const [materialResult] = await connection.query(
            "INSERT INTO materials (course_id, material_name, material_description, material_link, video_link) VALUES (?, ?, ?, ?, ?)", // Removed material_type
            [courseId, material_name, material_description, filePath, videoLink] 
          );
  
        const materialId = materialResult.insertId;
  
        if (parsedTopics && Array.isArray(parsedTopics) && parsedTopics.length > 0) {
          for (const topic of parsedTopics) {
            await connection.query(
              "INSERT INTO topics (material_id, topic_name, topic_content, written_code) VALUES (?, ?, ?, ?)",
              [
                materialId,
                topic.topicName,
                topic.topicContent,
                topic.writtenCode !== undefined ? topic.writtenCode : null,
              ]
            );
          }
        }
  
        await connection.commit();
        connection.release();
  
        res.status(201).json({
          message: "Material added successfully",
          materialId: materialId,
        });
      } catch (error) {
        await connection.rollback();
        connection.release();
        console.error("Database Error:", error); // Log the full error object
        return res.status(500).json({ error: error.message, fullError: error });
      }
    }
  );

app.post('/materials/:materialId/topics', authenticate, async (req, res) => {
  const { materialId } = req.params;
  const topics = req.body;

  // Log the received materialId and topics
  console.log('Received materialId:', materialId);
  console.log('Received topics:', topics);

  // Validation
  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ message: 'No topics provided or topics is not an array.' });
  }

  for (const topic of topics) {
    if (!topic.topicName || !topic.topicContent) {
      return res.status(400).json({ message: 'Each topic must have a topicName and topicContent.' });
  }
  }

  try {
    // Insert topics
    const insertPromises = topics.map(topic => {
      return pool.query( // Use pool here
        'INSERT INTO topics (material_id, topic_name, topic_content, written_code) VALUES (?, ?, ?, ?)',
        [materialId, topic.topicName, topic.topicContent, topic.writtenCode || null]
      ).catch(err => {
        // Log individual query errors for debugging
        console.error(`Error inserting topic: ${topic.topicName}`, err);
        throw err; // Rethrow to stop execution and return error
      });
    });

    // Wait for all insertions to complete
    await Promise.all(insertPromises);

    res.json({ message: 'Topics added successfully' });
  } catch (err) {
    console.error('Error adding topics:', err); // Log the final error message
    res.status(500).json({ message: 'Failed to add topics. Please check server logs for details.' });
  }
});
// Enroll in a course
app.post("/courses/:courseCode/enroll", authenticate, async (req, res) => {
  const { courseCode } = req.params;
  const userId = req.user.userId;

  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can enroll in courses" });
  }

  const connection = await pool.getConnection(); // Get a connection from the pool

  try {
    await connection.beginTransaction(); // Start a transaction

    // 1. Check if the course exists (case-insensitive)
    const [courseRows] = await connection.query(
      "SELECT * FROM courses WHERE LOWER(course_code) = LOWER(?)",
      [courseCode]
    );

    if (courseRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Check if the student is already enrolled
    const [existingEnrollment] = await connection.query(
      "SELECT * FROM enrollments WHERE user_id = ? AND LOWER(course_code) = LOWER(?)",
      [userId, courseCode]
    );

    if (existingEnrollment.length > 0) {
      await connection.rollback();
      connection.release();
      return res
        .status(400)
        .json({ message: "You are already enrolled in this course" });
    }

    // 3. Enroll the student in the course
    await connection.query(
      "INSERT INTO enrollments (user_id, course_code) VALUES (?, ?)",
      [userId, courseCode]
    );

    await connection.commit(); // Commit the transaction
    connection.release();       // Release the connection

    res.status(201).json({ message: "Successfully enrolled in the course" });
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    connection.release();       // Release the connection
    console.error("Error enrolling student:", error);
    res.status(500).json({ error: error.message });
    }
});


app.post("/process-image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded." });
  }

  const imagePath = path.join(__dirname, req.file.path);

  const python = spawn("python", ["process_image.py", imagePath]);

  let output = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
    console.error(`Error: ${data}`);
  });

  python.on("close", (code) => {
    if (code === 0) {
      try {
        const jsonResponse = JSON.parse(output);
        res.json({
          message: "Image processed successfully!",
          output_path: jsonResponse.output_path,
        });
      } catch (error) {
        console.error(
          `Error parsing Python output: ${output}, error: ${error}`
        );
        res.status(500).json({ error: "Error parsing Python output" });
      }
    } else {
      console.error(
        `Python script failed, code: ${code}, output: ${output}, stderr: ${errorOutput}`
      );
      res.status(500).json({
        error: "Python script failed",
        output: output,
       stderr: errorOutput,
      });
    }
    });
});

app.post(
  "/courses/:courseCode/assignments",
  authenticate,
  upload.single("pdf"),
  async (req, res) => {
    const { courseCode } = req.params;
    const { title, description, due_date } = req.body;
    const pdfPath = req.file ? req.file.path : null;

    try {
      //1. Validate the input data
      if (!title || !description || !due_date || !courseCode) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // 2. Check if the course exists
      const [courseRows] = await pool.query(
        "SELECT id FROM courses WHERE course_code = ?",
        [courseCode]
      );
      if (courseRows.length=== 0) {
        return res.status(404).json({ message: "Course not found" });
      }
      const courseId = courseRows[0].id; // Get the course ID

      // 3. Insert the assignment into the database
      const [result] = await pool.query(
        "INSERT INTO assignments (course_id, title, description, due_date, pdf_path) VALUES (?, ?, ?, ?, ?)",
        [courseId, title, description, due_date, pdfPath]
      );

      // 4. Send the response
      res.status(201).json({
        message: "Assignment added successfully",
        assignmentId: result.insertId,
      });
    } catch (error) {
      console.error("Error adding assignment:", error);
      res.status(500).json({ message: "Failed to add assignment" });
    }
    }
);

app.get("/users", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing." });
    }

    const [users] = await pool.query(
      "SELECT id, email, role, mobile_number, professor_email, created_at, status FROM users"
    );

    // If your database returns dates as Date objects, you might need to format them:
    const formattedUsers = users.map(user => ({
      ...user,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : null // Format as ISO string or suitable format
    }));


    res.status(200).json(formattedUsers); // Send the fetched users including their status
  } catch (error) {
    console.error("Error fetching users:", error);
    // In a real app, you might want more specific error messages based on the error type
    res.status(500).json({ error: error.message || "Failed to fetch users." });
  }
});


app.get("/courses", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM courses");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/courses/professor", authenticate, async (req, res) => {
  if (req.user.role !== "professor") {
    return res
      .status(403)
      .json({ message: "Only professors can view their courses" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM courses WHERE professor_id = ?",
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this professor" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching professor courses:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get course details by ID
app.get("/courses/:id", async (req, res) => {
  const courseId = req.params.id;

  try {
    const [rows] = await pool.query("SELECT * FROM courses WHERE id = ?", [
      courseId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/courses/:id/materials", async (req, res) => {
  const courseId = req.params.id;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM materials WHERE course_id = ?",
      [courseId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching materials for course:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/materials/:materialId", async (req, res) => {
  const materialId = req.params.materialId;
  try {
    const [results] = await pool.query("SELECT * FROM materials WHERE id = ?", [
      materialId,
    ]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Material not found" });
    }
    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching material:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/materials/:materialId/topics", async (req, res) => {
  const materialId = req.params.materialId;
  try {
    const [results] = await pool.query(
      "SELECT * FROM topics WHERE material_id = ?",
      [materialId]
    );
    res.json(results);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get enrollments for a user
app.get("/users/:userId/enrollments", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT c.id, c.course_code, c.course_name, c.course_description " +
      "FROM enrollments AS e " +
      "JOIN courses AS c ON LOWER(e.course_code) = LOWER(c.course_code) " +  // Case-insensitive join
      "WHERE e.user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/enrollments/:courseCode", authenticate, async (req, res) => {
  const { courseCode } = req.params;
  const userId = req.user.userId;

  try {
    const [existingEnrollment] = await pool.query(
      "SELECT * FROM enrollments WHERE user_id = ? AND course_code = ?",
      [userId, courseCode]
    );

    const [course] = await pool.query(
      "SELECT professor_id FROM courses WHERE course_code = ?",
      [courseCode]
    );

    if (
      existingEnrollment.length > 0 ||
      (course.length > 0 && course[0].professor_id === userId)
    ) {
      res.status(200).json({ enrolled: true });
    } else {
      res.status(404).json({ enrolled: false });
    }
    } catch (error) {
    console.error("Error checking enrollment:", error);
    res.status(500).json({ error: error.message });
    }
});

app.get("/courses/:courseCode/enrollments", authenticate, async (req, res) => {
  const { courseCode } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT u.id, u.email, u.role FROM enrollments e JOIN users u ON e.user_id = u.id WHERE e.course_code = ?",
      [courseCode]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/users/:professorId/courses", authenticate, async (req, res) => {
  const professorId = req.params.professorId;

  if (req.user.role !== "professor") {
    return res
      .status(403)
      .json({ message: "Only professors can view their courses" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM courses WHERE professor_id = ?",
      [professorId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this professor" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching professor courses:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/courses/:courseId/assignments", async (req, res) => {
  try {
    const { courseId } = req.params;// Assuming you're using a MySQL database and have a 'pool' object for queries
    const [rows] = await pool.query(
      "SELECT * FROM assignments WHERE course_id = ?",
      [courseId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/admin/professors/pending', authenticateAdmin, async (req, res) => {
  try {
    const [professors] = await pool.query(
      "SELECT id, email, mobile_number, professor_email, created_at FROM users WHERE role = 'professor' AND status = 'pending'"
    );

    const formattedProfessors = professors.map(prof => ({
      ...prof,
      created_at: new Date(prof.created_at).toISOString(),
    }));

    res.json(formattedProfessors);
  } catch (err) {
    console.error('Error fetching pending professors:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/admin/professors/:id/approve', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "UPDATE users SET status = 'approved' WHERE id = ? AND role = 'professor' AND status = 'pending'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Professor not found or not in pending status" });
    }

    // You might want to send an email to the professor here, informing them of approval.
    // This would require an email service (e.g., Nodemailer, SendGrid, Mailgun).

    res.json({ message: "Professor account approved successfully" });
  } catch (err) {
    console.error('Error approving professor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/admin/professors/:id/reject', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  // Optionally, you can include a 'reason' in the request body for rejection
  // const { reason } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE users SET status = 'rejected' WHERE id = ? AND role = 'professor' AND status = 'pending'",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Professor not found or not in pending status" });
    }

    // You might want to send an email to the professor here, informing them of rejection
    // and optionally including the reason.

    res.json({ message: "Professor account rejected successfully" });
  } catch (err) {
    console.error('Error rejecting professor:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete("/courses/:id", authenticate, async (req, res) => {
  const courseId = req.params.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [courseRows] = await connection.query(
      "SELECT professor_id FROM courses WHERE id = ?",
      [courseId]
    );

    if (courseRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Course not found" });
    }

    const courseProfessorId = courseRows[0].professor_id;

    if (courseProfessorId !== req.user.userId && req.user.role !== "admin") {
      await connection.rollback();
      connection.release();
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this course" });
    }

    await connection.query(
      "DELETE FROM topics WHERE material_id IN (SELECT id FROM materials WHERE course_id = ?)",
      [courseId]
    );

    await connection.query("DELETE FROM materials WHERE course_id = ?", [
      courseId,
    ]);

    const [deleteResult] = await connection.query(
      "DELETE FROM courses WHERE id = ?",
      [courseId]
    );

    await connection.commit();
    connection.release();

    if (deleteResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Course already deleted or not found" });
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    await connection.rollback();
    connection.release();
    res
      .status(500)
      .json({ message: "Error deleting course", error: error.message });
    }
});

app.delete("/materials/:materialId", authenticate, async (req, res) => {
  const materialId = req.params.materialId;

  if (req.user.role !== "professor") {
    return res
      .status(403)
      .json({ message: "Only professors can delete materials" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [materialRows] = await connection.query(
      "SELECT material_link FROM materials WHERE id = ?",
      [materialId]
    );

    if (materialRows.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: "Material not found" });
    }

    const materialLink = materialRows[0].material_link;

    await connection.query("DELETE FROM topics WHERE material_id = ?", [
      materialId,
    ]);
    await connection.query("DELETE FROM materials WHERE id = ?", [materialId]);

    await connection.commit();
    connection.release();

    // Remove the file from the server
    if (materialLink) {
      await fs.unlink(materialLink);
    }

    res.status(200).json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    await connection.rollback();
    connection.release();
    res
      .status(500)
      .json({ message: "Error deleting material", error: error.message });
    }
});

app.post('/execute-code', authenticate, async (req, res) => {
  try {
    const { code, language } = req.body;

    if (language === 'python') {
      // Python execution
      const codePath = path.join(__dirname, 'temp_code.py');
      await fs.writeFile(codePath, code);

      const python = spawn('python', [codePath]);
      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`Error: ${data}`);
      });

      python.on('close', async (closeCode) => {
        await fs.unlink(codePath); // Clean up the file
        if (closeCode === 0) {
          res.json({ output });
        } else {
          res.status(500).json({ error: 'Python execution failed', stderr: errorOutput });
        }
      });
    }  else {
      res.status(400).json({ error: 'Language not supported' });
    }
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/users/:userId', authenticateAdmin, async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Prevent admin from deleting themselves
        if (userId === req.user.userId) {
            return res.status(400).json({ error: 'You cannot delete your own account' });
        }

        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this delete route
app.delete("/assignments/:assignmentId", authenticate, async (req, res) => {
  const assignmentId = req.params.assignmentId;

  try {
    // Check if the assignment exists and get its associated course ID
    const [assignmentRows] = await pool.query(
      "SELECT course_id, pdf_path FROM assignments WHERE id = ?",
      [assignmentId]
    );

    if (assignmentRows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const courseId = assignmentRows[0].course_id;
    const pdfPath = assignmentRows[0].pdf_path;

    // Check if the user is authorized to delete the assignment (professor of the course or admin)
    const [courseRows] = await pool.query(
      "SELECT professor_id FROM courses WHERE id = ?",
      [courseId]
    );

    if (courseRows.length === 0) {
      return res.status(404).json({ message: "Course not found" }); // Should not happen, but good to check
    }

    const professorId = courseRows[0].professor_id;

    if (req.user.role !== "admin" && req.user.userId !== professorId) {
      return res.status(403).json({
        message: "You are not authorized to delete this assignment",
      });
    }

    // Delete the assignment
    const [deleteResult] = await pool.query(
      "DELETE FROM assignments WHERE id = ?",
      [assignmentId]
    );

    if (deleteResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Assignment already deleted or not found" });
    }

    // If there's an associated PDF, delete it
    if (pdfPath) {
      try {
        await fs.unlink(pdfPath);
      } catch (error) {
        console.error("Error deleting PDF:", error);
        // We don't want to fail the whole request if PDF deletion fails, so log and continue
      }
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
