import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Lock, Mail, Eye, EyeOff, Phone, User, GraduationCap } from 'lucide-react'; // Using lucide-react icons

const Signup = ({ setIsLoggedIn, onRoleChange }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('student');
    const [loading, setLoading] = useState(false);
    const [mobileNumber, setMobileNumber] = useState('');
    const [professorEmail, setProfessorEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null); // Custom message state
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const navigate = useNavigate();

    // Function to set and clear messages
    const showFeedbackMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        // Message will clear after the specified duration or upon new message
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null); // Clear previous messages
        setMessageType('');

        if (password !== confirmPassword) {
            showFeedbackMessage('Passwords do not match', 'error');
            setLoading(false);
            return;
        }

        let signupData = { email, password, role };
        if (role === 'professor') {
            signupData = { ...signupData, mobileNumber, professorEmail };
        }

        try {
            const response = await axios.post('http://localhost:8081/signup', signupData);
            
            if (role === 'professor') {
                showFeedbackMessage('An Admin will contact you soon, Thanks for Signing Up', 'success');
                // Delay navigation by 5 seconds to allow the message to be read
                setTimeout(() => {
                    navigate('/'); 
                    setMessage(null); // Clear message after navigation
                }, 5000); 
            }
            else {
                showFeedbackMessage('Signup successful! Please log in.', 'success');
                // Delay navigation by 3 seconds for students
                setTimeout(() => {
                    navigate('/login');
                    setMessage(null); // Clear message after navigation
                }, 3000);
            }
        } catch (error) {
            console.error('Signup error:', error);
            let errorMessage = "Signup failed. Please try again.";
            if (error.response) {
                if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                errorMessage = "A network error occurred. Please try again later.";
            } else {
                errorMessage = "An error occurred. Please try again later.";
            }

            showFeedbackMessage(errorMessage, 'error');
            // Error messages clear themselves, no delayed navigation on error
        } finally {
            setLoading(false);
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

    const buttonHover = {
        scale: 1.02,
        boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)"
    };

    const buttonTap = {
        scale: 0.98
    };

    const eyeButton = {
        rest: {
            scale: 1,
            opacity: 0.7,
            backgroundColor: "rgba(243, 244, 246, 0.5)"
        },
        hover: {
            scale: 1.1,
            opacity: 1,
            backgroundColor: "rgba(243, 244, 246, 1)",
            color: "#4f46e5"
        },
        tap: {
            scale: 0.9,
            backgroundColor: "rgba(229, 231, 235, 1)"
        }
    };

    const eyeIcon = {
        hidden: { rotate: -45, opacity: 0 },
        visible: { rotate: 0, opacity: 1 }
    };

    const messageVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="w-full max-w-md"
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                    whileHover={{ y: -5 }}
                >
                    <div className="p-8 sm:p-10">
                        <motion.div
                            className="text-center mb-8"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                <UserPlus className="text-indigo-600 text-2xl" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                Create an account
                            </h2>
                            <p className="mt-2 text-gray-600">
                                Join us to get started
                            </p>
                        </motion.div>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    variants={messageVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className={`p-3 mb-4 rounded-md text-sm ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                >
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.form
                            onSubmit={handleSubmit}
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="space-y-6"
                        >
                            <motion.div variants={item}>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email address
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition duration-150 ease-in-out"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={item}>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md transition duration-150 ease-in-out"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <motion.button
                                            type="button"
                                            className="text-gray-500 focus:outline-none rounded-full p-1.5"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            variants={eyeButton}
                                            initial="rest"
                                            whileHover="hover"
                                            whileTap="tap"
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={showPassword ? "visible" : "hidden"}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    variants={eyeIcon}
                                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </motion.span>
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={item}>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md transition duration-150 ease-in-out"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                        <motion.button
                                            type="button"
                                            className="text-gray-500 focus:outline-none rounded-full p-1.5"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            variants={eyeButton}
                                            initial="rest"
                                            whileHover="hover"
                                            whileTap="tap"
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={showConfirmPassword ? "visible" : "hidden"}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    variants={eyeIcon}
                                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </motion.span>
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={item}>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {/* Using GraduationCap for professor role, otherwise User */}
                                        {role === 'professor' ? <GraduationCap className="h-5 w-5 text-gray-400" /> : <User className="h-5 w-5 text-gray-400" />}
                                    </div>
                                    <select
                                        id="role"
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition duration-150 ease-in-out appearance-none bg-white"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        required
                                    >
                                        <option value="student">Student</option>
                                        <option value="professor">Professor</option>
                                    </select>
                                </div>
                            </motion.div>

                            {role === 'professor' && (
                                <>
                                    <motion.div
                                        variants={item}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mobile Number
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                id="mobileNumber"
                                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition duration-150 ease-in-out"
                                                placeholder="+1 (123) 456-7890"
                                                value={mobileNumber}
                                                onChange={(e) => setMobileNumber(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        variants={item}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        <label htmlFor="professorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            University Email
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                id="professorEmail"
                                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md transition duration-150 ease-in-out"
                                                placeholder="professor@university.edu"
                                                value={professorEmail}
                                                onChange={(e) => setProfessorEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                </>
                            )}

                            <motion.div variants={item}>
                                <motion.button
                                    type="submit"
                                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                    disabled={loading}
                                    whileHover={!loading ? buttonHover : {}}
                                    whileTap={!loading ? buttonTap : {}}
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing up...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <UserPlus className="mr-2" />
                                            Sign up
                                        </span>
                                    )}
                                </motion.button>
                            </motion.div>
                        </motion.form>

                        <motion.div
                            className="mt-6 text-center text-sm text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <p>
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                                >
                                    Log in
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Signup;
