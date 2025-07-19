import { useAuth } from "../../utils/AuthContext/AuthContext";
import AdminHeader from "./AdminHeader";
import Header from "./Header";

const CommonLayout = ({ children }) => {
  const { token, user } = useAuth();
  return (
    <div>
      {/* Header Component */}
      {
        user?.is_staff?<AdminHeader/>:<Header />
      }
      
      
      {/* Header Component */}

      {/* Main Component */}
      {children}
      {/* Main Component */}
    </div>
  );
};

export default CommonLayout;