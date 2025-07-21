import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";

export default function UserProfileSnapshot() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    avatar: null,
  });
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

const modalRef = useRef(null);
  const avatarRef = useRef(null);


  // Fetch profile on mount
  useEffect(() => {
    axios.get("http://localhost:8000/userprofile/profile/", {
      headers: { Authorization: `Token ${token}` }
    }).then(res => {
      setProfile(res.data);
      setForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
        avatar: null,
      });
    });
  }, [token]);


  // Menu close on click outside
  useEffect(() => {
  if (!showModal) return;
  const handler = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false);
    }
  };
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler);
}, [showModal]);


  // Handle form field changes
  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };


  // Patch profile info
  const handleSave = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("first_name", form.first_name);
    data.append("last_name", form.last_name);
    data.append("email", form.email);
    if (form.avatar) data.append("profile.avatar", form.avatar);
    try {
      const res = await axios.patch(
        "http://localhost:8000/api/userprofile/me/",
        data,
        { headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" } }
      );
      toast.success("Profile updated!");
      setProfile(res.data);
      setShowModal(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };


  if (!profile) return <div className="p-4">Loading profile...</div>;

  return (
    <div ref={avatarRef} className="relative ml-3">
      <img
        src={profile.profile?.avatar || "/DefaultAvatar.png"}
        alt="Avatar"
        onClick={() => setShowMenu(v => !v)}
        className="w-10 h-10 rounded-full object-cover border border-blue-300 shadow-sm cursor-pointer transition hover:ring-2 hover:ring-blue-200"
        style={{ minWidth: '2.5rem', minHeight: '2.5rem' }}
      />
      {showMenu && (
        <div className="absolute right-0 mt-2 bg-white border shadow-md rounded-xl py-2 z-50 min-w-[220px]">
          {/* User info inside the menu */}
          <div className="px-4 py-2 border-b">
            <div className="font-semibold break-all">{profile.username}</div>
            <div className="text-xs text-gray-600 break-all">{profile.email}</div>
          </div>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => { setShowModal(true); setShowMenu(false); }}
          >
            Edit Profile
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
      {/* Modal for editing profile */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <form
            className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md space-y-4"
            onSubmit={handleSave}
            encType="multipart/form-data"
          >
            <h2 className="text-xl font-bold mb-2 text-indigo-700 text-center">Edit Profile</h2>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border px-3 py-2 rounded w-full"
            />
            <div>
              <label className="text-sm text-gray-500 pr-2">Avatar:</label>
              <input
                type="file"
                name="avatar"
                onChange={handleChange}
                accept="image/*"
                className="border px-2 py-1 rounded"
              />
            </div>
            <div className="flex space-x-2 justify-center">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-1 rounded"
              >Save</button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-1 rounded"
                onClick={() => setShowModal(false)}
              >Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
