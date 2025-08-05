import { useLocation, useNavigate } from "react-router-dom";
import { server } from "../../constants/config";
import axios from "axios";


export default function LogoutButton() {
    const location = useLocation(); // Hook to get current route
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      //user logout
      try {
        await axios.get(`${server}/user/api/v1/logout`,{
            withCredentials:true
        });
        console.log("Logged out");
        navigate("/");
      } catch (error) {
        console.error("Logout failed", error);
      }
      //manager logout
      try {
        await axios.get(`${server}/manager/api/v1/logout`,{
            withCredentials:true
        });
        console.log("Logged out");
        navigate("/");
      } catch (error) {
        console.error("Logout failed", error);
      }
      //authority logout
      try {
        await axios.get(`${server}/auth/api/v1/logout`,{
            withCredentials:true
        });
        console.log("Logged out");
        navigate("/");
      } catch (error) {
        console.error("Logout failed", error);
      }
    };
  
    // Check if the current route is one of the dashboard routes
    const isDashboardRoute = ['/user-dashboard', '/manager-dashboard', '/authority-dashboard'].includes(location.pathname);
  
    return (
      <>
        {/* Show logout button only on dashboard pages */}
        {isDashboardRoute && (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </>
    );
  }