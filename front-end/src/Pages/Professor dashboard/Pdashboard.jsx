import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Extracted SVG icons as separate components for better reusability
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
    <path 
      fill="currentColor" 
      d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
    />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="currentColor" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle fill="currentColor" cx="9" cy="7" r="4" />
    <path fill="currentColor" d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path fill="currentColor" d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FilePlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline fill="currentColor" points="14 2 14 8 20 8" />
    <line stroke="currentColor" x1="12" y1="18" x2="12" y2="12" />
    <line stroke="currentColor" x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

// Dashboard card data
const dashboardCards = [
  {
    icon: <BookOpenIcon />,
    title: "Manage Courses",
    description: "Create, edit, and organize your course materials and resources",
    path: "/manage-courses"
  },
  {
    icon: <UsersIcon />,
    title: "Students",
    description: "View and manage enrolled students and their progress",
    path: "/enrolled-students"
  },
  {
    icon: <FilePlusIcon />,
    title: "Assignments",
    description: "Create and grade assignments with deadlines",
    path: "/add-assignment"
  }
];

// Animation variants
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

const professorIdVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1], 
      delay: 0.4 
    } 
  }
};

const ProfDashboard = () => {
  const navigate = useNavigate();
  const [professorId, setProfessorId] = useState(null);

  useEffect(() => {
    const storedProfessorId = localStorage.getItem('professor_id');
    if (storedProfessorId) {
      setProfessorId(storedProfessorId);
    }
  }, []);

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your courses, students, and academic activities in one place
          </p>
        </motion.div>

        {/* Professor ID Badge */}
        {professorId && (
          <motion.div
            variants={professorIdVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-lg shadow-sm p-3 mb-8 max-w-md mx-auto border border-indigo-100"
          >
            <p className="text-center text-indigo-700 font-medium">
              Instructor ID: <span className="font-semibold">{professorId}</span>
            </p>
          </motion.div>
        )}

        {/* Dashboard Cards Grid */}
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
                delay: index * 0.1 
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
                  {item.icon}
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

export default ProfDashboard;