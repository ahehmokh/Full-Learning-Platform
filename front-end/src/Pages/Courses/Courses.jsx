import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBook, FaSearch, FaArrowRight } from 'react-icons/fa';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('http://localhost:8081/courses');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCourses(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleViewCourse = (courseId) => {
        navigate(`/courseDetails/${courseId}`);
    };

    // Updated to only search by course_name
    const filteredCourses = courses.filter(course => 
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                        Explore Our Courses
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Discover a wide range of courses to enhance your skills and knowledge
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-10 max-w-2xl mx-auto"
                >
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search courses by name..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </motion.div>

                {/* Courses Grid */}
                {filteredCourses.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-white rounded-xl shadow-md"
                    >
                        <FaBook className="mx-auto text-gray-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {searchTerm ? 'No matching courses found' : 'No courses available'}
                        </h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try a different search term' : 'Check back later for new courses'}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredCourses.map((course) => (
                            <motion.div
                                key={course.id}
                                variants={item}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-indigo-100 p-3 rounded-full mr-4">
                                            <FaBook className="text-indigo-600" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {course.course_name}
                                        </h2>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-semibold">
                                            {course.course_code}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-600 mb-6 line-clamp-3">
                                        {course.course_description}
                                    </p>
                                    
                                    <motion.button
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleViewCourse(course.id)}
                                        className="flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                                    >
                                        View Details <FaArrowRight className="ml-2" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Courses;