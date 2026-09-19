import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSignOutAlt,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaSignInAlt,
  FaUserPlus,
  FaTimes,
  FaBars,
  FaUserShield,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const mobileMenuRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef]);

  // Check auth status and update on changes
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token) {
      setIsLoggedIn(true);
      setUserRole(storedRole);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for storage changes (e.g., after login)
  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuthStatus]);

    // Update state when localStorage changes
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        setIsLoggedIn(!!token); // Convert token to boolean
        setUserRole(role);
    }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/home");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Animation variants
  const mobileMenuVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren",
      },
    },
  };

  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };

  const logoVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={logoVariants}
          className="flex items-center"
        >
          <Link
            to="/"
            className="flex items-center text-white text-2xl font-bold tracking-tight"
            onClick={closeMobileMenu}
          >
            <FaUserGraduate className="mr-2 text-blue-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              LearnHub
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link
            to="/home"
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <FaHome className="mr-1" /> Home
          </Link>

          <Link
            to="/about"
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <FaInfoCircle className="mr-1" /> About
          </Link>

          <Link
            to="/contact"
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <FaEnvelope className="mr-1" /> Contact
          </Link>

          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <FaSignInAlt className="mr-1" /> Login
              </Link>

              <Link
                to="/signup"
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors shadow-md"
              >
                <FaUserPlus className="mr-1" /> Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/courses"
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <FaChalkboardTeacher className="mr-1" /> Courses
              </Link>

              {userRole === "professor" && (
                <Link
                  to="/professor-dashboard"
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                  Instructor Dashboard
                </Link>
              )}

              {userRole === "student" && (
                <Link
                  to="/student-dashboard"
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                  Student Dashboard
                </Link>
              )}
              {userRole === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                  <FaUserShield className="mr-1" />
                  Admin Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-red-600 transition-colors shadow-md"
              >
                <FaSignOutAlt className="mr-1" /> Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-300 hover:text-white focus:outline-none z-50"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <FaTimes className="w-6 h-6" />
          ) : (
            <FaBars className="w-6 h-6" />
          )}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40 lg:hidden"
                onClick={closeMobileMenu}
              />

              {/* Menu Content */}
              <motion.div
                ref={mobileMenuRef}
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileMenuVariants}
                className="fixed top-0 left-0 w-4/5 max-w-sm h-full bg-gray-800 shadow-xl z-50"
              >
                <div className="h-full flex flex-col pt-20 pb-6 px-6 overflow-y-auto">
                  <motion.ul className="flex flex-col space-y-4">
                    <motion.li variants={menuItemVariants}>
                      <Link
                        to="/home"
                        onClick={closeMobileMenu}
                        className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                      >
                        <FaHome className="mr-3" /> Home
                      </Link>
                    </motion.li>

                    <motion.li variants={menuItemVariants}>
                      <Link
                        to="/about"
                        onClick={closeMobileMenu}
                        className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                      >
                        <FaInfoCircle className="mr-3" /> About
                      </Link>
                    </motion.li>

                    <motion.li variants={menuItemVariants}>
                      <Link
                        to="/contact"
                        onClick={closeMobileMenu}
                        className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                      >
                        <FaEnvelope className="mr-3" /> Contact
                      </Link>
                    </motion.li>

                    {!isLoggedIn ? (
                      <>
                        <motion.li variants={menuItemVariants}>
                          <Link
                            to="/login"
                            onClick={closeMobileMenu}
                            className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                          >
                            <FaSignInAlt className="mr-3" /> Login
                          </Link>
                        </motion.li>

                        <motion.li variants={menuItemVariants}>
                          <Link
                            to="/signup"
                            onClick={closeMobileMenu}
                            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
                          >
                            <FaUserPlus className="mr-3" /> Sign Up
                          </Link>
                        </motion.li>
                      </>
                    ) : (
                      <>
                        <motion.li variants={menuItemVariants}>
                          <Link
                            to="/courses"
                            onClick={closeMobileMenu}
                            className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                          >
                            <FaChalkboardTeacher className="mr-3" /> Courses
                          </Link>
                        </motion.li>

                        {userRole === "professor" && (
                          <motion.li variants={menuItemVariants}>
                            <Link
                              to="/professor-dashboard"
                              onClick={closeMobileMenu}
                              className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                            >
                              Instructor Dashboard
                            </Link>
                          </motion.li>
                        )}

                        {userRole === "student" && (
                          <motion.li variants={menuItemVariants}>
                            <Link
                              to="/student-dashboard"
                              onClick={closeMobileMenu}
                              className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                            >
                              Student Dashboard
                            </Link>
                          </motion.li>
                        )}

                        {userRole === "admin" && (
                          <motion.li variants={menuItemVariants}>
                            <Link
                              to="/admin-dashboard"
                              onClick={closeMobileMenu}
                              className="flex items-center text-gray-300 hover:text-white py-3 px-4 rounded-lg transition-colors"
                            >
                              <FaUserShield className="mr-3" />
                              Admin Dashboard
                            </Link>
                          </motion.li>
                        )}

                        <motion.li variants={menuItemVariants}>
                          <button
                            onClick={() => {
                              handleLogout();
                              closeMobileMenu();
                            }}
                            className="flex items-center w-full bg-red-600 hover:bg-red-700 text-red-600 py-3 px-4 rounded-lg transition-colors"
                          >
                            <FaSignOutAlt className="mr-3" /> Logout
                          </button>
                        </motion.li>
                      </>
                    )}
                  </motion.ul>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;

