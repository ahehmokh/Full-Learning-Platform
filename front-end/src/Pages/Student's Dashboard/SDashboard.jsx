import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, Clock, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalEnrolled, setTotalEnrolled] = useState(0);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("student_id");

        if (!token || !userId) {
          setError("You are not logged in or user ID is missing.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:8081/users/${userId}/enrollments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEnrolledCourses(data);
        setTotalEnrolled(data.length);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const highlightMatch = (text, match) => {
    if (!match) return text;

    const regex = new RegExp(`(${match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filteredCourses = enrolledCourses.filter((course) =>
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-indigo-600 mb-6 text-center"
        >
          Your Enrolled Courses
        </motion.h1>
        
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "linear"
          }}
          className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent"
        />
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-gray-600 text-lg"
        >
          Loading your courses...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-8"
      >
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 border border-red-200 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Courses</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50"
    >
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-2">
            Your Enrolled Courses
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-200 to-purple-200 mx-auto max-w-md rounded-full"
          />
        </motion.div>

        {/* Search and Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" />
          </div>
          
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="font-medium text-gray-700">Total Enrolled: </span>
            <span className="font-bold text-indigo-600">{totalEnrolled}</span>
          </div>
        </motion.div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center"
          >
            <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery ? "No matching courses found" : "No enrolled courses"}
            </h3>
            <p className="text-gray-500">
              {searchQuery 
                ? `No courses match "${searchQuery}"`
                : "You haven't enrolled in any courses yet"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:border-indigo-300 transition-all"
                >
                  <Link
                    to={`/courseDetails/${course.id}`}
                    className="block h-full"
                  >
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                          <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {highlightMatch(course.course_name, searchQuery)}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4 flex-grow">
                        {course.course_description || "No description available"}
                      </p> 
                      <div className="mt-4 flex justify-end">
                        <button className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                          View Details <ChevronRight className="ml-1 w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentDashboard;