import { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
// The import for CSS is causing an error in this environment when imported directly.
// This line is commented out. Ensure react-toastify's CSS is loaded globally (e.g., in index.html or a main CSS file)
// import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion for animations

const AddCourse = () => {
    const [courseData, setCourseData] = useState({
        course_name: '',
        course_description: '',
        course_code: '',
        start_date: '',
        end_date: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No token found. Please log in again.');
                setLoading(false); // Ensure loading is reset if no token
                return;
            }

            const response = await axios.post(
                'http://localhost:8081/courses',
                {
                    course_name: courseData.course_name,
                    course_description: courseData.course_description,
                    course_code: courseData.course_code,
                    start_date: courseData.start_date,
                    end_date: courseData.end_date,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Course added:', response.data);
            toast.success('Course added successfully!');
            navigate('/manage-courses');
        } catch (error) {
            console.error('Error adding course:', error.response?.data || error.message);
            toast.error(error.response?.data?.message || 'Error adding course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Animation variants
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
    };

    const formContainerVariants = {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.2 } },
    };

    const inputItemVariants = {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    const buttonVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } },
        hover: { scale: 1.02, boxShadow: "0 4px 10px rgba(59, 130, 246, 0.3)" }, // Tailwind blue-500
        tap: { scale: 0.98 },
    };

    return (
        <motion.div
            className="container mx-auto p-4 min-h-screen flex items-center justify-center bg-gray-50 font-inter"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.div
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto"
                variants={formContainerVariants}
                initial="initial"
                animate="animate"
            >
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Add New Course</h1>
                <form onSubmit={handleSubmit}>
                    <motion.div className="mb-4" variants={inputItemVariants}>
                        <label htmlFor="course_name" className="block text-gray-700 text-sm font-bold mb-2">
                            Course Name
                        </label>
                        <input
                            type="text"
                            id="course_name"
                            name="course_name"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            placeholder="Enter course name"
                            value={courseData.course_name}
                            onChange={handleChange}
                            required
                        />
                    </motion.div>
                    <motion.div className="mb-4" variants={inputItemVariants}>
                        <label htmlFor="course_description" className="block text-gray-700 text-sm font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            id="course_description"
                            name="course_description"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            placeholder="Enter course description"
                            value={courseData.course_description}
                            onChange={handleChange}
                            required
                        />
                    </motion.div>
                    <motion.div className="mb-4" variants={inputItemVariants}>
                        <label htmlFor="course_code" className="block text-gray-700 text-sm font-bold mb-2">
                            Course Code
                        </label>
                        <input
                            type="text"
                            id="course_code"
                            name="course_code"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            placeholder="Enter course code"
                            value={courseData.course_code}
                            onChange={handleChange}
                            required
                        />
                    </motion.div>
                    <motion.div className="mb-4" variants={inputItemVariants}>
                        <label htmlFor="start_date" className="block text-gray-700 text-sm font-bold mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            value={courseData.start_date}
                            onChange={handleChange}
                            required
                        />
                    </motion.div>
                    <motion.div className="mb-6" variants={inputItemVariants}>
                        <label htmlFor="end_date" className="block text-gray-700 text-sm font-bold mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end_date"
                            name="end_date"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            value={courseData.end_date}
                            onChange={handleChange}
                            required
                        />
                    </motion.div>
                    <motion.button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        initial="initial"
                        animate="animate"
                    >
                        {loading ? 'Adding...' : 'Add Course'}
                    </motion.button>
                </form>
            </motion.div>
            <ToastContainer />
        </motion.div>
    );
};

export default AddCourse;
