import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Extracted SVG icons as separate components for better reusability and clarity
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="currentColor" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle fill="currentColor" cx="9" cy="7" r="4" />
    <path fill="currentColor" d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path fill="currentColor" d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
    <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 12l2 2 4-4" />
  </svg>
);

const XCircleIcon = () => ( // Note: This icon is not used in the dashboardCards but is provided.
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
    <path fill="none" stroke="currentColor" strokeWidth="2" d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

// Dashboard card data defining the navigation links
const dashboardCards = [
  {
    icon: UsersIcon,
    title: "User Management",
    description: "Manage all user accounts and roles.",
    path: "/user-management" // This path is consistent with your App.js routing
  },
  {
    icon: CheckCircleIcon,
    title: "Professor Approvals",
    description: "Approve or reject new professor applications.",
    path: "/Professor-Approval"
  }
];

// Animation variants for the dashboard cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  hover: {
    scale: 1.03,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  tap: { scale: 0.98 }
};

// Animation variants for the admin ID badge
const adminIdVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.4 // Delay to appear after header
        }
    }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState(null);

  // Fetch admin ID from local storage on component mount
  useEffect(() => {
    // Assuming 'adminId' is the correct key used when saving the ID after login
    const storedAdminId = localStorage.getItem('adminId');
    if (storedAdminId) {
      setAdminId(storedAdminId);
    }
  }, []);

  // Handler for card clicks, navigates to the specified path
  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-8 font-inter">
      <div className="max-w-6xl mx-auto">
        {/* Header Section with animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage users, permissions, and system settings efficiently.
          </p>
        </motion.div>

        {/* Admin ID Badge with animation */}
        {adminId && (
            <motion.div
                variants={adminIdVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-lg shadow-sm p-3 mb-8 max-w-md mx-auto border border-indigo-100"
            >
                <p className="text-center text-indigo-700 font-medium">
                    Admin ID: <span className="font-semibold">{adminId}</span>
                </p>
            </motion.div>
        )}

        {/* Dashboard Cards Grid with staggered animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.1 // Stagger the appearance of cards
              }}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer flex flex-col"
              onClick={() => handleCardClick(item.path)}
              role="button"
              tabIndex={0}
              aria-label={`Navigate to ${item.title}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCardClick(item.path)}
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto rounded-lg bg-indigo-100 text-indigo-600">
                  {/* Render the icon component directly using JSX syntax */}
                  <item.icon />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-center text-sm">
                  {item.description}
                </p>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="text-center">
                  <span className="text-indigo-600 font-medium text-sm hover:text-indigo-700 transition-colors">
                    Go to {item.title} →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
