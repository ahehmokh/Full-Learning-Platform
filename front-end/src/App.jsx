import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
    Navigate,
    Outlet,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Pages/Navbar/Navbar";
import Login from "./Pages/Login/Login";
import Signup from "./Pages/SignUp/Signup";
import HomePage from "./Pages/HomePage/Homepage";
import Courses from "./Pages/Courses/Courses";
import About from "./Pages/About/about";
import ProfDashboard from "./Pages/Professor dashboard/Pdashboard";
import CourseManage from "./Pages/Courses Management/Course-Mange";
import AddCourse from "./Pages/Adding Course/CourseAdd";
import AddMaterial from "./Pages/Add Material/Addmaterial";
import CourseDetails from "./Pages/Course Details/CourseDetails";
import MaterialDetails from "./Pages/MaterialDetails/MaterialDetails";
import CodeIDE from "./Pages/CodeIDE/CodeIDE";
import Contact from "./Pages/Contact/Contact";
import SDashboard from "./Pages/Student's Dashboard/SDashboard";
import AddAssignment from "./Pages/Assignments/Assignments";
import EnrolledStudents from "./Pages/EnrolledStudents/EnrolledStudents";
import Footer from "./Pages/Footer/Footer";
import ScrollToTop from "./Pages/ScrollToTop/ScrollTop";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard"; // Import AdminDashboard
import UserManagement from "./Pages/UserMangement/UserMangement"; // Corrected import
import ProfessorApproval from "./Pages/ProfessorApproval/ProfessorApproval";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [storageChange, setStorageChange] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");
        setIsLoggedIn(!!token);
        setUserRole(storedRole);
    }, [storageChange]);  // Remove the dependency on handleLogout


    useEffect(() => {
        const clearAuthData = () => {
            if (!localStorage.getItem('token')) {
                setIsLoggedIn(false);
                setUserRole(null);
            }
        };

        const handleRefresh = () => {
            clearAuthData();
        };

        window.addEventListener('load', handleRefresh);

        return () => {
            window.removeEventListener('load', handleRefresh);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setUserRole(null);
        setStorageChange(prev => prev + 1);
    }

    const handleRoleChange = (newRole) => {
        setUserRole(newRole);
        setStorageChange((prev) => prev + 1);
    };

    const ProtectedLayout = () => {
        if (isLoggedIn) {
            return (
                <>
                    <Navbar userRole={userRole} onLogout={handleLogout} />
                    <Outlet />
                    <Footer />
                    <ScrollToTop />
                </>
            );
        } else {
            return <Navigate to="/login" replace />;
        }
    };

    const PublicLayout = () => {
        return (
            <>
                <Navbar userRole={userRole} onLogout={handleLogout} />
                <Outlet />
                <Footer />
                <ScrollToTop />
            </>
        );
    };

    const router = createBrowserRouter(
        createRoutesFromElements(
            <>
                <Route element={<PublicLayout />}>
                    <Route
                        path="/login"
                        element={<Login setIsLoggedIn={setIsLoggedIn} onRoleChange={handleRoleChange} />}
                    />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route
                        path="/"
                        element={<HomePage />}
                    />
                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Route>

                <Route element={<ProtectedLayout />}>
                    <Route path="/professor-dashboard" element={<ProfDashboard />} />
                    <Route path="/manage-courses" element={<CourseManage />} />
                    <Route path="/Add-Course" element={<AddCourse />} />
                    <Route path="/add-material/:courseId" element={<AddMaterial />} />
                    <Route path="/courseDetails/:id" element={<CourseDetails userRole={userRole} />} />
                    <Route path="/materials/:materialId/view" element={<MaterialDetails />} />
                    <Route path="/ide/:code" element={<CodeIDE />} />
                    <Route path="/student-dashboard" element={<SDashboard />} />
                    <Route path="/add-assignment" element={<AddAssignment />} />
                    <Route path="/enrolled-students" element={<EnrolledStudents userRole={userRole} />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/user-management" element={<UserManagement />} /> 
                    <Route path="/Professor-Approval" element={<ProfessorApproval />} />
                </Route>
            </>
        )
    );

    return <RouterProvider router={router} />;
}

export default App;
