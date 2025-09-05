
import { useAuth } from '../../utils/AuthContext/AuthContext';

const AdminHeader = () => {
    const { user,logout  } = useAuth();
  return (
    <header className="bg-white h-[13vh] sm:h-[10vh] shadow-md flex flex-col sm:flex-row  items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <a href="/admin/">
            <span className="text-xl sm:text-2xl font-bold text-indigo-600">Bookhub</span>
          </a>
        </div>
        <div className="flex items-center space-y-2 space-x-4 mt-2 ">
          <span className="text-sm text-gray-500">
            {user && `Logged in as: ${user.username}`}
          </span>
          <button
            onClick={logout}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>
  )
}

export default AdminHeader
