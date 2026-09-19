import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';
import { motion } from 'framer-motion';

const AddAssignment = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                const professorId = localStorage.getItem('professor_id');

                if (!professorId) {
                    toast.error('Professor ID not found. Please log in again.');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:8081/users/${professorId}/courses`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
                if (error.response) {
                    toast.error(error.response.data?.message || 'Failed to fetch courses.');
                } else {
                    toast.error('Failed to fetch courses.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description || !dueDate || !selectedCourseId) {
            toast.error('Please fill in all the required fields and select a course.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('due_date', dueDate);

        if (pdfFile) {
            formData.append('pdf', pdfFile);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8081/courses/${selectedCourseId}/assignments`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            toast.success('Assignment added successfully!');
            setTitle('');
            setDescription('');
            setDueDate('');
            setPdfFile(null);
        } catch (error) {
            console.error('Error adding assignment:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to add assignment.');
            }
        }
    };

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleCourseChange = (e) => {
        setSelectedCourseId(e.target.value);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } },
    };

    const formVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-6 text-center text-3xl font-extrabold text-indigo-700 animate__animated animate__fadeInDown"
                >
                    Add Assignment
                </motion.h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ensure to fill all the fields correctly.
                </p>

                {isLoading ? (
                    <p className="text-center text-gray-600 animate__animated animate__fadeIn">Loading courses...</p>
                ) : courses && courses.length > 0 ? (
                    <motion.div variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
                        <div>
                            <label htmlFor="courseSelect" className="block text-sm font-medium text-gray-700">
                                Select Course:
                            </label>
                            <select
                                id="courseSelect"
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                value={selectedCourseId || ''}
                                onChange={handleCourseChange}
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.course_code} value={course.course_code}>
                                        {course.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                ) : (
                    <div className="text-center text-gray-600 animate__animated animate__fadeIn">
                        <p>No courses found for this professor.</p>
                    </div>
                )}

                {selectedCourseId && (
                    <motion.form variants={formVariants} initial="hidden" animate="visible" onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title:
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter assignment title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description:
                                </label>
                                <textarea
                                    id="description"
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter assignment description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                                    Due Date:
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700">
                                    Assignment File (PDF):
                                </label>
                                <input
                                    type="file"
                                    id="pdfFile"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Assignment
                            </motion.button>
                        </div>
                    </motion.form>
                )}
            </div>
            <ToastContainer />
        </motion.div>
    );
};

export default AddAssignment;