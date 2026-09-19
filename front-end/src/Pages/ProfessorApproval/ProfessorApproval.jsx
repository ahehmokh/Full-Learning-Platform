import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ProfessorApproval = () => {
    const [pendingProfessors, setPendingProfessors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionMessage, setActionMessage] = useState(''); // For success/error messages after action

    // Function to fetch pending professors
    const fetchPendingProfessors = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token'); // Get admin's JWT token
            if (!token) {
                setError('Authentication token not found. Please log in as an admin.');
                setLoading(false);
                return;
            }
            const response = await axios.get('http://localhost:8081/admin/professors/pending', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setPendingProfessors(response.data);
        } catch (err) {
            console.error('Error fetching pending professors:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch pending professors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProfessors();
    }, []); // Fetch on component mount

    // Function to handle professor approval
    const handleApprove = async (professorId) => {
        setActionMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8081/admin/professors/${professorId}/approve`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setActionMessage('Professor approved successfully!');
            // Remove the approved professor from the list
            setPendingProfessors(prev => prev.filter(prof => prof.id !== professorId));
        } catch (err) {
            console.error('Error approving professor:', err);
            setActionMessage(err.response?.data?.message || err.message || 'Failed to approve professor.');
        }
    };

    // Function to handle professor rejection
    const handleReject = async (professorId) => {
        setActionMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8081/admin/professors/${professorId}/reject`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setActionMessage('Professor rejected successfully!');
            // Remove the rejected professor from the list
            setPendingProfessors(prev => prev.filter(prof => prof.id !== professorId));
        } catch (err) {
            console.error('Error rejecting professor:', err);
            setActionMessage(err.response?.data?.message || err.message || 'Failed to reject professor.');
        }
    };

    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -50, transition: { duration: 0.3 } } // Exit animation for removed items
    };

    const messageVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 font-inter rounded-lg">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold mb-4 sm:mb-0">Professor Approval Requests</h1>
                <motion.button // Changed to motion.button
                    onClick={fetchPendingProfessors}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-black font-semibold rounded-md shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    whileTap={{ scale: 0.95 }} // Added whileTap animation
                >
                    Refresh List
                </motion.button>
            </header>

            <AnimatePresence>
                {actionMessage && (
                    <motion.div
                        variants={messageVariants} // Using shared message variants
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`p-3 mb-4 rounded-md text-sm ${actionMessage.includes('successfully') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                    >
                        {actionMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait"> {/* Use mode="wait" to ensure one animation finishes before the next starts */}
                {loading ? (
                    <motion.p
                        key="loading" // Add a key for AnimatePresence to track
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="text-gray-500 dark:text-gray-400 text-lg"
                    >
                        Loading pending professor requests...
                    </motion.p>
                ) : error ? (
                    <motion.p
                        key="error" // Add a key
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="text-red-500 dark:text-red-400 text-lg"
                    >
                        Error: {error}
                    </motion.p>
                ) : pendingProfessors.length === 0 ? (
                    <motion.p
                        key="no-professors" // Add a key
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="text-gray-500 dark:text-gray-400 text-lg"
                    >
                        No pending professor requests at this time.
                    </motion.p>
                ) : (
                    <motion.div
                        key="table" // Add a key
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md"
                    >
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Mobile Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Professor Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Requested At
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <AnimatePresence>
                                <motion.tbody
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                                >
                                    {pendingProfessors.map((professor) => (
                                        <motion.tr
                                            key={professor.id}
                                            variants={itemVariants}
                                            layout // Enable layout animations for list changes
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {professor.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {professor.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {professor.mobile_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {professor.professor_email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {new Date(professor.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <motion.button // Changed to motion.button
                                                    onClick={() => handleApprove(professor.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-green-500 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-2 transition-colors transform hover:scale-105"
                                                    whileTap={{ scale: 0.9 }} // Smaller press effect for action buttons
                                                >
                                                    Approve
                                                </motion.button>
                                                <motion.button // Changed to motion.button
                                                    onClick={() => handleReject(professor.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-red-600 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors transform hover:scale-105"
                                                    whileTap={{ scale: 0.9 }} // Smaller press effect for action buttons
                                                >
                                                    Reject
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </AnimatePresence>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfessorApproval;