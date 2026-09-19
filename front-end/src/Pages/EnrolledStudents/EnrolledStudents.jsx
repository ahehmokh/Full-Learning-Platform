import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import axios from 'axios';

const EnrolledStudents = ({ userRole }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseCode, setSelectedCourseCode] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const id = 0;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const professorId = localStorage.getItem('professor_id');
        const token = localStorage.getItem('token');

        const response = await axios.get(`http://localhost:8081/users/${professorId}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          console.error('Invalid courses data:', response.data);
          toast.error('Invalid course data received.');
          setError('Invalid course data received.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to fetch courses. Please try again.');
        setLoading(false);
        toast.error('Failed to fetch courses. Please try again.');
      }
    };

    if (userRole === 'professor') {
      fetchCourses();
    } else {
      const errorMessage = 'Unauthorized: Only professors can view courses.';
      setError(errorMessage);
      setLoading(false);
      toast.error('Unauthorized access.');
    }
  }, [userRole]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (selectedCourseCode) {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8081/courses/${selectedCourseCode}/enrollments`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && Array.isArray(response.data)) {
            setEnrollments(response.data);
          }
          else {
            setEnrollments([]);
          }

        } catch (err) {
          console.error('Error fetching enrollments:', err);
          setError(err.message || 'Failed to fetch enrollments. Please try again.');
          toast.error('Failed to fetch enrollments. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEnrollments();
  }, [selectedCourseCode]);

  const handleCourseSelect = (courseCode) => {
    setSelectedCourseCode(courseCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate__animated animate__fadeIn">
        <div className="text-center">
          <div className="animate-spin text-4xl text-indigo-500 mb-4">Loading...</div>
          <p className="text-gray-700">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center animate__animated animate__fadeIn">
        <div className="max-w-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (userRole !== 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center animate__animated animate__fadeIn">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Unauthorized Access</h2>
          <p className="text-gray-600">Only professors can view courses.</p>
        </div>
      </div>
    );
  }

  // Function to get all unique keys from the enrollments data
  const getAllKeys = (data) => {
    if (!data || data.length === 0) return [];
    const keys = new Set();
    data.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(key => keys.add(key));
      }
    });
    return Array.from(keys);
  };

  const allKeys = enrollments && enrollments.length > 0 ? getAllKeys(enrollments) : [];


  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 animate__animated animate__fadeIn">
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-indigo-700 mb-4 sm:mb-6 text-center animate__animated animate__fadeInDown"
        >
          Enrolled Students
        </h1>

        {courses.length === 0 ? (
          <div className="text-center mt-8">
            <p className="text-gray-600">You haven't added any Courses.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Select Course:</label>
              <select
                onChange={(e) => handleCourseSelect(e.target.value)}
                value={selectedCourseCode || ''}
                className="w-full sm:w-[300px] md:w-[350px] shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.course_code} value={course.course_code}>
                    {course.course_name} ({course.course_code})
                  </option>
                ))}
              </select>
            </div>

            {selectedCourseCode && enrollments.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 text-gray-700">
                      <tr>
                        <th className="px-3 sm:px-4 md:px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                          #
                        </th>
                        {allKeys.map((key) => {
                          let displayKey = key;
                          displayKey = displayKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

                          return (
                            <th key={key} className="px-3 sm:px-4 md:px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider">
                              {displayKey}
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {enrollments.map((enrollment, index) => (
                        <motion.tr
                          key={enrollment.id}
                          className="hover:bg-gray-100 transition-colors"
                        >
                          <td className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 border-b border-gray-200 text-sm">
                            {index + 1}
                          </td>
                          {allKeys.map(key => {
                            const value = enrollment[key] !== undefined ? enrollment[key] : 'N/A';
                            return (
                              <td key={id} className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 border-b border-gray-200 text-sm">
                                {value !== null ? value.toString() : 'null'}
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
            {selectedCourseCode && enrollments.length === 0 && (
              <div className="text-center mt-4">
                <p>No enrollments found for this course.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnrolledStudents;
