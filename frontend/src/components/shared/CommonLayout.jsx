import { useAuth } from "../../utils/AuthContext/AuthContext";
import UserHeader from "../header-section/UserHeader";
import AdminHeader from "../header-section/AdminHeader";

const CommonLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div>
      {/* Header Component */}
      {
        user?.is_staff?<AdminHeader/>:<UserHeader />
      }
      
      
      {/* Header Component */}

      {/* Main Component */}
      {children}
      {/* Main Component */}
    </div>
  );
};

export default CommonLayout;