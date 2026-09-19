import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, MessageSquare, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Contact = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [pageLoaded, setPageLoaded] = useState(false);

    useEffect(() => {
        setPageLoaded(true);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setMessage({ 
                text: 'Message sent successfully!', 
                type: 'success' 
            });
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error:', error);
            setMessage({ 
                text: 'Failed to send message. Please try again.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                when: "beforeChildren"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const buttonVariants = {
        hover: { 
            scale: 1.02,
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)"
        },
        tap: { scale: 0.98 }
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6"
            variants={containerVariants}
            initial="hidden"
            animate={pageLoaded ? "visible" : "hidden"}
        >
            <motion.div 
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl sm:text-3xl font-bold"
                    >
                        Contact Us
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-indigo-100 mt-1"
                    >
                        We'd love to hear from you
                    </motion.p>
                </div>

                {/* Form */}
                <motion.form 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 space-y-6"
                >
                    {/* Name Field */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-indigo-500" />
                                Your Name
                            </div>
                        </label>
                        <input 
                            type="text" 
                            id="name" 
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                            placeholder="John Doe" 
                            required 
                            value={formData.name} 
                            onChange={handleChange} 
                        />
                    </motion.div>

                    {/* Email Field */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                                Email Address
                            </div>
                        </label>
                        <input 
                            type="email" 
                            id="email" 
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                            placeholder="your@email.com" 
                            required 
                            value={formData.email} 
                            onChange={handleChange} 
                        />
                    </motion.div>

                    {/* Message Field */}
                    <motion.div variants={itemVariants}>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
                                Your Message
                            </div>
                        </label>
                        <textarea 
                            id="message" 
                            rows="4" 
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                            placeholder="How can we help you?" 
                            required 
                            value={formData.message} 
                            onChange={handleChange} 
                        />
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants} className="pt-2">
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Status Message */}
                    <AnimatePresence>
                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                            >
                                <div className="flex items-center">
                                    {message.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                    )}
                                    <span>{message.text}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.form>
            </motion.div>
        </motion.div>
    );
};

export default Contact;