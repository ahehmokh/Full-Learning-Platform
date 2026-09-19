import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { FaArrowRight, FaStar, FaGraduationCap } from 'react-icons/fa';

const HomePage = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8081/courses');
                setCourses(response.data);
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleExploreCourses = () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (token && role) {
            navigate('/courses');
        } else {
            toast.error('Please login first.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
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

    const bounce = {
        initial: { y: -20, opacity: 0 },
        animate: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 10,
                duration: 0.5
            }
        },
        hover: {
            y: -5,
            transition: { type: "spring", stiffness: 500 }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 font-sans">
            <ToastContainer />
            
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 -rotate-6 scale-125"></div>
                <div className="relative py-32 px-4 lg:px-0 flex items-center justify-center">
                    <motion.div 
                        className="container mx-auto max-w-7xl text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.h1
                            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-gray-900"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Unlock Your Potential
                            </span>
                            <br />
                            with LearnHub
                        </motion.h1>
                        
                        <motion.p
                            className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            Learn from experts and gain in-demand skills to advance your career.
                        </motion.p>
                        
                        <motion.div 
                            className="flex flex-col sm:flex-row justify-center gap-4"
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.button
                                variants={bounce}
                                whileHover="hover"
                                onClick={handleExploreCourses}
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Explore Courses <FaArrowRight />
                            </motion.button>
                            
                            <motion.button
                                variants={bounce}
                                whileHover="hover"
                                onClick={() => navigate('/about')}
                                className="flex items-center justify-center gap-2 bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600  font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Learn More <FaGraduationCap />
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Courses Section */}
            {!loading && courses.length > 0 && (
                <section className="py-20 px-4 lg:px-0 bg-white">
                    <div className="container mx-auto max-w-7xl">
                        <motion.h2
                            className="text-4xl font-bold text-center mb-16 text-gray-900"
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Featured Courses
                            </span>
                        </motion.h2>
                        
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                        >
                            {courses.slice(0, 3).map((course) => (
                                <motion.div
                                    key={course.id}
                                    variants={item}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                                        <FaGraduationCap className="text-white text-6xl opacity-20" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="flex items-center text-yellow-400">
                                                <FaStar />
                                                <FaStar />
                                                <FaStar />
                                                <FaStar />
                                                <FaStar className="text-gray-300" />
                                            </div>
                                            <span className="text-sm text-gray-500 ml-2">(24 reviews)</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{course.course_name}</h3>
                                        <p className="text-gray-600 mb-4">{course.course_description}</p>
                                        <button 
                                            onClick={handleExploreCourses}
                                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                                        >
                                            Enroll Now
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="container mx-auto max-w-7xl px-4 lg:px-0">
                    <motion.div 
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-md"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <div className="text-4xl font-bold text-indigo-600 mb-2">10K+</div>
                            <div className="text-gray-600">Students</div>
                        </motion.div>
                        
                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-md"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
                            <div className="text-gray-600">Courses</div>
                        </motion.div>
                        
                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-md"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <div className="text-4xl font-bold text-indigo-600 mb-2">100+</div>
                            <div className="text-gray-600">Instructors</div>
                        </motion.div>
                        
                        <motion.div 
                            className="bg-white p-6 rounded-xl shadow-md"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <div className="text-4xl font-bold text-indigo-600 mb-2">95%</div>
                            <div className="text-gray-600">Satisfaction</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto max-w-7xl px-4 lg:px-0">
                    <motion.h2
                        className="text-4xl font-bold text-center mb-16 text-gray-900"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            What Our Students Say
                        </span>
                    </motion.h2>
                    
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <motion.div
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg relative"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                                    <span className="text-2xl font-bold text-indigo-600">AJ</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Alice Johnson</h4>
                                    <p className="text-gray-600">Software Engineer</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic mb-4">"LearnHub has been instrumental in my career transition. The instructors are knowledgeable and supportive."</p>
                            <div className="flex text-yellow-400">
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                            </div>
                        </motion.div>
                        
                        <motion.div
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-xl shadow-lg relative"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                                    <span className="text-2xl font-bold text-indigo-600">BW</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Bob Williams</h4>
                                    <p className="text-gray-600">Data Analyst</p>
                                </div>
                            </div>
                            <p className="text-gray-700 italic mb-4">"I highly recommend LearnHub to anyone looking to upskill or learn new technologies. The courses are well-structured and practical."</p>
                            <div className="flex text-yellow-400">
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="container mx-auto max-w-7xl px-4 lg:px-0 text-center">
                    <motion.h2
                        className="text-4xl font-bold mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        Ready to Start Learning?
                    </motion.h2>
                    
                    <motion.p
                        className="text-xl mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                    >
                        Join thousands of students advancing their careers with our courses.
                    </motion.p>
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExploreCourses}
                        className="bg-white text-indigo-600 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Get Started Now
                    </motion.button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;