import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [actionMessage, setActionMessage] = useState(''); // State for action success/error messages

    // Function to fetch users
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8081/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
        }
    };

    // Fetch users on component mount and whenever a refresh is explicitly requested
    useEffect(() => {
        fetchUsers();
    }, []); // Empty dependency array means this runs once on mount.

    // Filter and sort users
    const filteredUsers = users
        .filter(user => user.role !== 'admin') // Exclude users with the role 'admin'
        .filter(user => user.role !== 'professor' || (user.role === 'professor' && user.status === 'approved'))
        .filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.mobile_number && user.mobile_number.includes(searchTerm)) ||
            (user.professor_email && user.professor_email.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            const roleOrder = {
                'professor': 2,
                'student': 3,
            };
            const roleA = a.role ? a.role.toLowerCase() : 'student';
            const roleB = b.role ? b.role.toLowerCase() : 'student';
            return roleOrder[roleA] - roleOrder[roleB];
        });

    const formatDate = (dateString) => {
        if (!dateString) return 'NULL';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleDelete = async (userId) => {
        setActionMessage(''); // Clear previous messages
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8081/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Update the state to remove the deleted user, and then re-fetch to ensure consistency
            setUsers(users.filter(user => user.id !== userId));
            setUserToDelete(null);
            setShowConfirmation(false);
            setActionMessage('User deleted successfully!');
            fetchUsers(); // Re-fetch users after deletion to get the most current list
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setActionMessage('Failed to delete user.');
        }
    };

    const openConfirmation = (userId) => {
        setUserToDelete(userId);
        setShowConfirmation(true);
    }

    const closeConfirmation = () => {
        setShowConfirmation(false);
        setUserToDelete(null);
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05, // Reduced stagger for faster overall appearance
                when: "beforeChildren",
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3 } } // Explicit exit animation
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const controlsVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } },
    };

    return (
        <div className="admin-dashboard min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8 font-inter rounded-lg">
            <motion.header
                className="dashboard-header flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700"
                variants={headerVariants}
                initial="hidden"
                animate="visible"
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-0">User Management</h1>
            </motion.header>

            {actionMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-3 mb-4 rounded-md text-sm ${actionMessage.includes('successfully') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                >
                    {actionMessage}
                </motion.div>
            )}

            <div className="content">
                <motion.div
                    className="controls flex flex-col sm:flex-row justify-between items-center mb-4 space-y-4 sm:space-y-0"
                    variants={controlsVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="search-box flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 w-full sm:w-64 md:w-80"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'}
                        </span>
                    </div>
                    {/* Added a Refresh Button */}
                    <motion.button
                        onClick={fetchUsers}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-yellow-400 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.185A8.964 8.001 0 0110 1a9 9 0 016 15.657A9.003 9.003 0 0110 19a9 9 0 01-6-15.657V17a1 1 0 11-2 0V3a1 1 0 011-1zm3 8a3 3 0 116 0 3 3 0 01-6 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        Refresh Users
                    </motion.button>
                </motion.div>

                {loading ? (
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Loading users...</p>
                ) : error ? (
                    <p className="text-red-500 dark:text-red-400 text-lg">Error: {error}</p>
                ) : (
                    <div className="table-container rounded-lg border shadow-md overflow-x-auto bg-white dark:bg-gray-800">
                        <motion.table
                            className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                            variants={containerVariants} // Apply container variants to the table
                            initial="hidden"
                            animate="visible"
                        >
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile Number</th>
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Professor Email</th> {/* Corrected header */}
                                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <AnimatePresence>
                                <motion.tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredUsers.map(user => (
                                        <motion.tr
                                            key={user.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit" // Ensure exit animation is applied
                                            layout // Enable layout animations for smooth transitions
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.id}</td>
                                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.email || 'NULL'}</td>
                                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.role || 'NULL'}</td>
                                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(user.created_at)}</td>
                                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.mobile_number || 'NULL'}</td>
                                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{user.professor_email || 'NULL'}</td>
                                            <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <motion.button
                                                    onClick={() => openConfirmation(user.id)}
                                                    className="inline-flex items-center px-2 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-red-600 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors transform hover:scale-110"
                                                    title="Delete User"
                                                    whileHover={{ scale: 1.1 }} // Animation on hover
                                                    whileTap={{ scale: 0.9 }}   // Animation on tap
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1.6-1.3 3-3 3H8c-1.7 0-3-1.3-3-3V6"></path><path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </AnimatePresence>
                        </motion.table>
                    </div>
                )}
            </div>
            {showConfirmation && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm text-center"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Are you sure?</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            This action cannot be undone. This will permanently delete this user.
                        </p>
                        <div className="flex justify-center gap-4">
                            <motion.button
                                onClick={closeConfirmation}
                                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                onClick={() => handleDelete(userToDelete)}
                                className="px-5 py-2 bg-red-600 text-red-600 rounded-md hover:bg-red-700 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Delete
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default UserManagement;
