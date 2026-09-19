import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaSignInAlt, FaUserPlus, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaUserShield } from "react-icons/fa"; // Added admin icon

const Login = ({ setIsLoggedIn, onRoleChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8081/login", {
        email,
        password,
      });
      const { token, role, professorId, studentId } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "professor") {
        localStorage.setItem("professor_id", professorId);
      } else if (role === "student") {
        localStorage.setItem("student_id", studentId);
      }

      setIsLoggedIn(true);
      onRoleChange(role);

      // Use a single navigate call with a default
      let redirectTo = "/home";
      if (role === "student") {
        redirectTo = "/student-dashboard";
      } else if (role === "professor") {
        redirectTo = "/professor-dashboard";
      } else if (role === "admin") {
        redirectTo = "/admin-dashboard"; //  redirect for admin
      }
      navigate(redirectTo);

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } catch (error) {
      console.error("Error logging in:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "A network error occurred. Please check your connection.";
      } else {
        errorMessage = "An unexpected error occurred. Please try again later.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
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
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const buttonHover = {
    scale: 1.02,
    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.3)",
  };

  const buttonTap = {
    scale: 0.98,
  };

  // Eye button animations
  const eyeButton = {
    rest: {
      scale: 1,
      opacity: 0.7,
      backgroundColor: "rgba(243, 244, 246, 0.5)",
    },
    hover: {
      scale: 1.1,
      opacity: 1,
      backgroundColor: "rgba(243, 244, 246, 1)",
      color: "#4f46e5",
    },
    tap: {
      scale: 0.9,
      backgroundColor: "rgba(229, 231, 235, 1)",
    },
  };

  const eyeIcon = {
    hidden: { rotate: -45, opacity: 0 },
    visible: { rotate: 0, opacity: 1 },
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
                <FaLock className="text-indigo-600 text-2xl" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-gray-600">
                Sign in to your account
              </p>
            </motion.div>

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
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
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
                    <FaLock className="h-5 w-5 text-gray-400" />
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
                            <FaEyeSlash className="h-4 w-4" />
                          ) : (
                            <FaEye className="h-4 w-4" />
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

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
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSignInAlt className="mr-2" />
                      Sign in
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
                Don't have an account?{" "}
                <Link
                  to="/Signup"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  <span className="flex items-center justify-center">
                    <FaUserPlus className="mr-1" /> Sign up
                  </span>
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </motion.div>
  );
};

export default Login;
