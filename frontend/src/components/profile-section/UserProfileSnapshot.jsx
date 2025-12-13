import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../utils/AuthContext/AuthContext";
import { toast } from "react-toastify";
import AvatarSkeleton from "../../Skeleton/AvatarSkeleton";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const modalRef = useRef(null);
  const avatarRef = useRef(null);
  const menuRef = useRef(null);

  // Close modal on outside click
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

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Fetch profile on mount
  useEffect(() => {
    if (!token) return;
    axios.get(`${backendUrl}/userprofile/profile/`, {
      headers: { Authorization: `Token ${token}` }
    }).then(res => {
      setProfile(res.data);
      setForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
        avatar: null,
      });
    }).catch(() => {
      toast.error("Failed to load profile");
    });
  }, [token]);

  // Form field changes
  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  // Patch profile info
  const handleSave = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append("first_name", form.first_name);
    data.append("last_name", form.last_name);
    data.append("email", form.email);
    if (form.avatar) data.append("avatar", form.avatar);

    try {
      const res = await axios.patch(
        `${backendUrl}/userprofile/profile/`,
        data,
        { headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" } }
      );
      console.log("Backend Response:", res.data);
      toast.success("Profile updated!");
      setProfile(res.data);
      setShowModal(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  // Logout confirmation modal outside click close
  const logoutModalRef = useRef();
  useEffect(() => {
    if (!showLogoutConfirm) return;
    function handleClickOutside(event) {
      if (logoutModalRef.current && !logoutModalRef.current.contains(event.target)) {
        setShowLogoutConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogoutConfirm]);

  if (!profile) return <AvatarSkeleton />;

  return (
    <div className="relative inline-block ml-3">
      <img
        ref={avatarRef}
        src={profile.profile?.avatar
          ? (profile.profile.avatar.startsWith("http") ? profile.profile.avatar : `${backendUrl}${profile.profile.avatar}`)
          : "/DefaultAvatar.png"}
        alt="Avatar"
        onClick={() => setShowMenu(v => !v)}
        className="w-10 h-10 rounded-full border border-blue-300 shadow-sm object-cover cursor-pointer transition hover:ring-2 hover:ring-blue-200"
        style={{ minWidth: '2.5rem', minHeight: '2.5rem' }}
      />
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-3 bg-white rounded-xl shadow-md min-w-[220px] border border-blue-200 z-50"
        >
          <div className="p-4 border-b border-blue-200">
            <div className="font-semibold break-words text-gray-800">{profile.username}</div>
            <div className="text-xs mt-1 text-gray-600 break-words">{profile.email}</div>
          </div>
          <button
            onClick={() => { setShowModal(true); setShowMenu(false); }}
            className="w-full text-left px-4 py-3 hover:bg-blue-100 text-blue-700 font-medium transition"
          >
            Edit Profile
          </button>
          <button
            onClick={() => { setShowLogoutConfirm(true); setShowMenu(false); }}
            className="w-full text-left px-4 py-3 hover:bg-blue-100 text-blue-700 font-medium transition"
          >
            Logout
          </button>
        </div>
      )}
      {showModal && (
  <div
    className="fixed inset-0 bg-black/40 bg-opacity-40 flex items-center justify-center z-50"
    style={{ backdropFilter: "blur(2px)" }}
    onClick={() => setShowModal(false)}
  >
    <form
      ref={modalRef}
      className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-blue-100"
      onClick={e => e.stopPropagation()}
      onSubmit={handleSave}
      encType="multipart/form-data"
    >
      <h2 className="text-lg font-semibold mb-5 text-gray-900 text-center">
        Edit Profile
      </h2>
      <input
        type="text"
        name="first_name"
        value={form.first_name}
        onChange={handleChange}
        placeholder="First Name"
        className="border border-gray-300 rounded px-4 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      <input
        type="text"
        name="last_name"
        value={form.last_name}
        onChange={handleChange}
        placeholder="Last Name"
        className="border border-gray-300 rounded px-4 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="border border-gray-300 rounded px-4 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      <div className="mb-4">
        <label className="block text-gray-600 mb-1" htmlFor="avatar">
          Avatar
        </label>
        <input
          id="avatar"
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>
      <div className="flex justify-center gap-4">
        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow transition"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" 
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full border border-blue-200 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-center text-red-600 font-bold text-xl mb-4">Confirm Logout</h3>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  logout();
                  setShowLogoutConfirm(false);
                }}
                className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 transition"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded shadow hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
