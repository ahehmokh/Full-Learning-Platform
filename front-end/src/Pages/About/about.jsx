import { useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaQuoteLeft, FaGraduationCap, FaLightbulb, FaUsers, FaStar } from 'react-icons/fa';

const About = () => {
    const [faqs, setFaqs] = useState([
        {
            question: "What is LearnHub?",
            answer: "LearnHub is an online learning platform offering a diverse range of courses to empower individuals through knowledge."
        },
        {
            question: "How do I enroll?",
            answer: "Create an account (or log in), browse our catalog, choose a course, and follow the enrollment process. We offer various payment options."
        },
        {
            question: "Payment methods?",
            answer: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal for secure payments."
        },
        {
            question: "Refund policy?",
            answer: "We offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days for a full refund."
        },
        {
            question: "Contact support?",
            answer: "Email us at ahehmokh@gmail.com or use our contact form"
        }
    ]);

    const toggleFAQ = (index) => {
        setFaqs(faqs.map((faq, i) => (i === index ? { ...faq, isOpen: !faq.isOpen } : faq)));
    };

    const teamSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
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

    const fadeIn = {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
                        About LearnHub
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Empowering learners worldwide through accessible, high-quality education
                    </p>
                </motion.div>

                {/* Mission Section */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
                >
                    <div className="p-8 md:p-12">
                        <motion.div variants={item} className="mb-8">
                            <h2 className="text-3xl font-bold text-indigo-700 mb-4">Our Mission</h2>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                At LearnHub, we believe learning should be accessible, engaging, and transformative. 
                                Our platform connects learners with world-class courses and expert instructors to help 
                                them achieve their personal and professional goals.
                            </p>
                        </motion.div>

                        <motion.div variants={container} className="grid md:grid-cols-2 gap-8">
                            <motion.div 
                                variants={item}
                                whileHover={{ y: -5 }}
                                className="bg-indigo-50 p-6 rounded-xl"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                                        <FaGraduationCap className="text-indigo-600 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-indigo-700">Quality Education</h3>
                                </div>
                                <p className="text-gray-700">
                                    We curate only the highest quality courses from industry experts and top educators.
                                </p>
                            </motion.div>

                            <motion.div 
                                variants={item}
                                whileHover={{ y: -5 }}
                                className="bg-purple-50 p-6 rounded-xl"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                                        <FaLightbulb className="text-purple-600 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-purple-700">Innovative Learning</h3>
                                </div>
                                <p className="text-gray-700">
                                    We leverage cutting-edge technology to create engaging and effective learning experiences.
                                </p>
                            </motion.div>

                            <motion.div 
                                variants={item}
                                whileHover={{ y: -5 }}
                                className="bg-blue-50 p-6 rounded-xl"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                                        <FaUsers className="text-blue-600 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-blue-700">Global Community</h3>
                                </div>
                                <p className="text-gray-700">
                                    Join a diverse community of learners from around the world to share knowledge and grow together.
                                </p>
                            </motion.div>

                            <motion.div 
                                variants={item}
                                whileHover={{ y: -5 }}
                                className="bg-pink-50 p-6 rounded-xl"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="bg-pink-100 p-3 rounded-full mr-4">
                                        <FaStar className="text-pink-600 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-pink-700">Lifetime Access</h3>
                                </div>
                                <p className="text-gray-700">
                                    Once you enroll, you get lifetime access to course materials and updates.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Team Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12"
                >
                    <div className="p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-12">Meet Our Team</h2>
                        
                        <Slider {...teamSettings} className="team-slider">
                            {[
                                { name: "Ahmed Ehab", role: "Front-End React Developer" },
                                { name: "Ahmed Tolba", role: "Front-End React Developer" },
                                { name: "Kiroloos Ehab", role: "SQL Database Developer" },
                                { name: "Omar Shehab", role: "SQL Database Developer" },
                                { name: "Mosatafa Ibrahim", role: "UI / UX Developer" },
                                { name: "Abdelrahman El-Ashhab", role: "Backend Express.js Developer" },
                                { name: "Mohammed Hussien", role: "Backend Express.js Developer" },
                                { name: "Mohammed ", role: "Digital Image Processing Developer" }
                            ].map((member, index) => (
                                <div key={index} className="px-4">
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl text-center h-full"
                                    >
                                        <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-white shadow-lg">
                                            <img 
                                                src={`https://placehold.co/200x200/EEE/31343C?text=${member.name.split(' ')[0][0]}`} 
                                                alt={member.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-indigo-700">{member.name}</h3>
                                        <p className="text-gray-600">{member.role}</p>
                                    </motion.div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                </motion.div>

                {/* Vision & Offerings */}
                <motion.div 
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 gap-8 mb-12"
                >
                    <motion.div 
                        variants={item}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden p-8"
                    >
                        <h2 className="text-3xl font-bold text-indigo-700 mb-6">Our Vision</h2>
                        <div className="flex items-start mb-4">
                            <div className="text-indigo-500 mr-4 mt-1">
                                <FaQuoteLeft className="text-2xl opacity-70" />
                            </div>
                            <p className="text-lg text-gray-700 italic">
                                To be the world's leading platform for transformative online learning, where anyone can 
                                access the knowledge and skills they need to thrive in an ever-changing world.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div 
                        variants={item}
                        className="bg-white rounded-2xl shadow-xl overflow-hidden p-8"
                    >
                        <h2 className="text-3xl font-bold text-indigo-700 mb-6">What We Offer</h2>
                        <ul className="space-y-3">
                            {[
                                "Diverse courses across multiple disciplines",
                                "High-quality video lectures and materials",
                                "Interactive learning experiences",
                                "Global community of learners",
                                "Flexible learning schedules",
                                "Certificates of completion",
                                "Expert instructor support"
                            ].map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-indigo-500 mr-3 mt-1">•</span>
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </motion.div>

                {/* FAQ Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 mb-12"
                >
                    <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">Frequently Asked Questions</h2>
                    
                    <motion.div variants={container} className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div 
                                key={index} 
                                variants={item}
                                className="border-b border-gray-200 last:border-0 pb-4"
                            >
                                <motion.div
                                    className="flex justify-between items-center cursor-pointer py-3"
                                    onClick={() => toggleFAQ(index)}
                                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                                >
                                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                                    {faq.isOpen ? (
                                        <FaChevronUp className="text-indigo-600" />
                                    ) : (
                                        <FaChevronDown className="text-indigo-600" />
                                    )}
                                </motion.div>
                                
                                <AnimatePresence>
                                    {faq.isOpen && (
                                        <motion.div
                                            initial="hidden"
                                            animate="show"
                                            exit="hidden"
                                            variants={fadeIn}
                                            className="pl-2 pr-4 pt-2 pb-4 text-gray-700"
                                        >
                                            {faq.answer}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* CTA Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden p-8 text-center"
                >
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
                    <p className="text-indigo-100 text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of students advancing their careers with our courses.
                    </p>
                    <Link 
                        to="/courses"
                        className="inline-block bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300"
                    >
                        Browse Courses
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default About;