import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaBook, FaCalendarAlt, FaTrash, FaEdit, FaDownload, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';

const CourseDetails = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const [isCourseOwner, setIsCourseOwner] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const [courseRes, materialsRes, assignmentsRes] = await Promise.all([
                    fetch(`http://localhost:8081/courses/${id}`),
                    fetch(`http://localhost:8081/courses/${id}/materials`),
                    fetch(`http://localhost:8081/courses/${id}/assignments`)
                ]);

                if (!courseRes.ok || !materialsRes.ok || !assignmentsRes.ok) {
                    throw new Error('Failed to fetch course details');
                }

                const [courseData, materialsData, assignmentsData] = await Promise.all([
                    courseRes.json(),
                    materialsRes.json(),
                    assignmentsRes.json()
                ]);

                setCourse(courseData);
                setMaterials(materialsData);
                setAssignments(assignmentsData);

                const token = localStorage.getItem("token");
                if (token) {
                    const role = localStorage.getItem("role");
                    setUserRole(role);
                    
                    const userId = role === "student" 
                        ? localStorage.getItem("student_id") 
                        : localStorage.getItem("professor_id");
                    
                    setUserId(userId);

                    if (role === "professor") {
                        setIsCourseOwner(courseData.professor_id === parseInt(userId));
                    }

                    // Check enrollment status
                    const enrollmentRes = await fetch(
                        `http://localhost:8081/enrollments/${courseData.course_code}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setEnrolled(enrollmentRes.ok);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [id]);

    const handleEnroll = async () => {
        if (!localStorage.getItem("token")) {
            toast.error("Please log in to enroll");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8081/courses/${course.course_code}/enroll`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId }),
                }
            );

            if (response.ok) {
                setEnrolled(true);
                toast.success("Successfully enrolled in the course!");
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to enroll");
            }
        } catch {
            toast.error("An error occurred. Please try again.");
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8081/${type}s/${id}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.ok) {
                if (type === "material") {
                    setMaterials(materials.filter(m => m.id !== id));
                } else {
                    setAssignments(assignments.filter(a => a.id !== id));
                }
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
            } else {
                throw new Error("Failed to delete");
            }
        } catch {
            toast.error("Failed to delete. Please try again.");
        }
    };

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const cardHover = {
        hover: { 
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
        }
    };

    if (loading) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50"
            >
                <motion.div
                    animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                        rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity }
                    }}
                    className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent"
                />
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50"
            >
                <div className="max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        );
    }

    if (!course) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50"
            >
                <div className="max-w-md p-6 bg-white rounded-xl shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h2>
                    <p className="text-gray-700 mb-6">The requested course doesn't exist.</p>
                    <Link 
                        to="/courses"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-block"
                    >
                        Browse Courses
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="max-w-6xl mx-auto">
                {/* Course Header */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
                >
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                                    {course.course_name}
                                </h1>
                                <p className="text-lg text-indigo-600 font-medium mb-4">
                                    {course.course_code}
                                </p>
                            </div>
                            
                            {!enrolled && userRole !== "professor" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleEnroll}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                                >
                                    <FaGraduationCap className="inline mr-2" />
                                    Enroll Now
                                </motion.button>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FaCalendarAlt className="text-indigo-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Start Date</p>
                                        <p className="font-medium">
                                            {new Date(course.start_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FaCalendarAlt className="text-indigo-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">End Date</p>
                                        <p className="font-medium">
                                            {new Date(course.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FaChalkboardTeacher className="text-indigo-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">Instructor</p>
                                        <p className="font-medium">
                                            {course.professor_name || "Not specified"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                            <p className="text-gray-700 whitespace-pre-line">
                                {course.course_description}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Materials Section */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="mb-12"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <FaBook className="mr-3 text-indigo-600" />
                            Course Materials
                        </h2>
                    </div>

                    {materials.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {materials.map((material) => (
                                <motion.div
                                    key={material.id}
                                    variants={item}
                                    whileHover="hover"
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="p-6 h-full flex flex-col">
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                                {enrolled || isCourseOwner ? (
                                                    <Link 
                                                        to={`/materials/${material.id}/view`}
                                                        className="hover:text-indigo-600 transition-colors flex items-center"
                                                    >
                                                        {material.material_name}
                                                        <FiExternalLink className="ml-2 text-sm" />
                                                    </Link>
                                                ) : (
                                                    material.material_name
                                                )}
                                            </h3>
                                            {material.material_description && (
                                                <p className="text-gray-600 mb-4 line-clamp-3">
                                                    {material.material_description}
                                                </p>
                                            )}
                                        </div>
                                        
                                        {isCourseOwner && (
                                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleDelete("material", material.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete material"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <FaBook className="mx-auto text-gray-400 text-4xl mb-4" />
                            <h3 className="text-lg font-medium text-gray-600">
                                No materials available for this course
                            </h3>
                        </div>
                    )}
                </motion.div>

                {/* Assignments Section */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <FaBook className="mr-3 text-indigo-600" />
                            Assignments
                        </h2>
                    </div>

                    {assignments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assignments.map((assignment) => (
                                <motion.div
                                    key={assignment.id}
                                    variants={item}
                                    whileHover="hover"
                                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="p-6 h-full flex flex-col">
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                                {assignment.title}
                                            </h3>
                                            {assignment.description && (
                                                <p className="text-gray-600 mb-4">
                                                    {assignment.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                                <FaCalendarAlt className="mr-2" />
                                                Due: {new Date(assignment.due_date).toLocaleDateString()}
                                            </div>
                                            
                                            {(enrolled || isCourseOwner) && assignment.pdf_path && (
                                                <a
                                                    href={`http://localhost:8081/${assignment.pdf_path}`}
                                                    download
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                                                >
                                                    <FaDownload className="mr-2" />
                                                    Download Assignment
                                                </a>
                                            )}
                                        </div>
                                        
                                        {isCourseOwner && (
                                            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleDelete("assignment", assignment.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete assignment"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <FaBook className="mx-auto text-gray-400 text-4xl mb-4" />
                            <h3 className="text-lg font-medium text-gray-600">
                                No assignments available for this course
                            </h3>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CourseDetails;