import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import "animate.css";
import {
  PlusCircle,
  Trash2,
  FolderPlus,
  FolderOpen,
} from "lucide-react";

const CourseManage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "http://localhost:8081/courses/professor",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(response.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourseClick = () => {
    navigate("/add-course");
  };

  const handleDeleteCourse = async (courseId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirmation) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:8081/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setCourses((prevCourses) =>
          prevCourses.filter((course) => course.id !== courseId)
        );
        toast.success("Course deleted successfully.");
      } else {
        toast.error("Failed to delete course.");
      }
    } catch (err) {
      toast.error("Error deleting course.");
      console.error("Error deleting course:", err);
      if (err.response) {
        console.log(err.response.data);
        console.log(err.response.status);
      }
    }
  };

  const handleAddMaterial = (courseId) => {
    navigate(`/add-material/${courseId}`);
  };

  const handleViewMaterial = (courseId) => {
    navigate(`/courseDetails/${courseId}`);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      backgroundColor: "rgba(238, 242, 255, 0.5)",
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)"
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0 2px 6px rgba(79, 70, 229, 0.1)"
    },
  };

  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 md:p-8 text-white">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="text-3xl md:text-4xl font-extrabold mb-2 text-center"
          >
            Manage Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-indigo-100 text-center max-w-2xl mx-auto"
          >
            Create, edit, and manage your courses and course materials
          </motion.p>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Your Courses
              </h2>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleAddCourseClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add New Course</span>
              </motion.button>
            </div>

            {/* Loading State */}
            {loading && (
              <motion.div
                variants={loadingVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-center py-12"
              >
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && courses.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-indigo-50 rounded-xl p-8 text-center"
              >
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven't created any courses yet. Click the button above to add your first course.
                </p>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleAddCourseClick}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 mx-auto shadow-md"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Course</span>
                </motion.button>
              </motion.div>
            )}

            {/* Courses Table */}
            {!loading && courses.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="overflow-x-auto rounded-xl shadow-sm border border-gray-200"
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <motion.tr
                        key={course.id}
                        variants={itemVariants}
                        whileHover="hover"
                        className="hover:bg-indigo-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {course.course_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {course.course_code}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {truncateText(course.course_description, 30)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(course.start_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(course.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <motion.button
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => handleViewMaterial(course.id)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                              title="View Materials"
                            >
                              <FolderOpen className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => handleAddMaterial(course.id)}
                              className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors"
                              title="Add Material"
                            >
                              <FolderPlus className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                              title="Delete Course"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default CourseManage;