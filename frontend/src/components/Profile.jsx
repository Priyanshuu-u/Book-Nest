import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const backendurl = "https://book-nest-backend-7lyo.onrender.com";

/**
 * Visually enhanced Profile dashboard
 * - Keeps the robust storage detection logic (including "Users")
 * - Fetches user's books and blogs and displays them with beautiful pink/white themed UI
 * - Responsive layout, consistent card sizes, image object-cover, and daisyUI buttons
 */
const Profile = () => {
  const [user, setUser] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: try to parse JSON safely
  const tryParse = (raw) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };

  // Try to extract a user object from many common storage shapes
  const findStoredUser = () => {
    const candidateKeys = [
      "user",
      "Users", // support your existing key
      "authUser",
      "currentUser",
      "profile",
      "loggedUser",
      "persist:user",
      "persist:root",
      "auth",
    ];

    for (const key of candidateKeys) {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = tryParse(raw);
      if (parsed && typeof parsed === "object") {
        if (parsed._id || parsed.id) {
          return parsed;
        }
        if (parsed.user && (parsed.user._id || parsed.user.id)) {
          return parsed.user;
        }
        if (parsed.data && parsed.data.user && (parsed.data.user._id || parsed.data.user.id)) {
          return parsed.data.user;
        }
        if (parsed.auth && parsed.auth.user && (parsed.auth.user._id || parsed.auth.user.id)) {
          return parsed.auth.user;
        }
      }
    }
    return null;
  };

  // Initial load: find stored user and subscribe to storage events
  useEffect(() => {
    const u = findStoredUser();
    setUser(u);
    setLoading(false);

    const onStorage = () => {
      const updated = findStoredUser();
      setUser(updated);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch user's books & blogs after we know the user
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const [booksResp, blogsResp] = await Promise.all([
          axios.get(`${backendurl}/book`),
          axios.get(`${backendurl}/blog`),
        ]);
        const books = booksResp.data || [];
        const blogs = blogsResp.data || [];

        const uid = user._id || user.id;
        const filteredBooks = books.filter((b) => {
          if (!uid) return false;
          if (!b.userId) return false;
          if (typeof b.userId === "object") {
            return b.userId._id === uid || b.userId === uid;
          }
          return b.userId === uid;
        });

        const filteredBlogs = blogs.filter((blog) => {
          if (!uid) return false;
          if (!blog.author) return false;
          if (typeof blog.author === "string") return blog.author === uid;
          if (typeof blog.author === "object") {
            return (
              blog.author._id === uid ||
              blog.author === uid ||
              blog.author.fullname === user.fullname
            );
          }
          return false;
        });

        setMyBooks(filteredBooks);
        setMyBlogs(filteredBlogs);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Small helpers
  const initials = (name = "") =>
    name
      .split(" ")
      .map((n) => n?.[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");

  const formatPrice = (p) => {
    if (p === undefined || p === null) return "—";
    return Number(p) === 0 ? "Free" : `₹ ${p}`;
  };

  // Beautiful empty / loading states
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-rose-50 to-white py-12">
          <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-2xl shadow-lg ring-1 ring-rose-100">
            <h2 className="text-2xl font-extrabold text-rose-600 mb-3">Profile</h2>
            <p className="text-gray-600 mb-6">You are not logged in.</p>
            <p className="text-sm text-gray-500">
              Open your console to see storage keys or login/signup to view your dashboard.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-rose-50 to-white min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mt-8 rounded-2xl bg-white shadow-md p-6 flex flex-col md:flex-row items-start md:items-center gap-6 ring-1 ring-rose-50">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-3xl font-bold shadow-inner">
                {initials(user.fullname)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-rose-600">{user.fullname}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="mt-1 text-xs text-rose-400">ID: <span className="text-rose-600">{user._id || user.id}</span></p>
              </div>
            </div>

            <div className="ml-auto flex gap-3">
              <button
                onClick={() => {
                  // quick signout helper
                  localStorage.removeItem("Users");
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
                className="btn btn-ghost btn-sm text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>

              <button
                onClick={() => alert("Edit profile feature coming soon!")}
                className="btn btn-rose btn-sm text-white"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-sm ring-1 ring-rose-50 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Listed Books</p>
                <p className="text-2xl font-semibold text-rose-600">{myBooks.length}</p>
              </div>
              <div className="text-rose-50 bg-rose-400 rounded-full w-12 h-12 flex items-center justify-center shadow">
                📚
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-sm ring-1 ring-rose-50 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Blog Posts</p>
                <p className="text-2xl font-semibold text-rose-600">{myBlogs.length}</p>
              </div>
              <div className="text-rose-50 bg-rose-400 rounded-full w-12 h-12 flex items-center justify-center shadow">
                📝
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-sm ring-1 ring-rose-50 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Recent Activity</p>
                <p className="text-2xl font-semibold text-rose-600">{/* placeholder */}—</p>
              </div>
              <div className="text-rose-50 bg-rose-400 rounded-full w-12 h-12 flex items-center justify-center shadow">
                ⭐
              </div>
            </div>
          </div>

          {/* Main columns: Books on left, Blogs on right */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Books */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-rose-600">My Listed Books</h2>
                <div className="text-sm text-gray-500">{myBooks.length} items</div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="animate-pulse p-4 bg-white rounded-xl shadow-sm flex gap-4">
                      <div className="w-28 h-20 bg-rose-50 rounded-md" />
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-rose-50 rounded w-1/3" />
                        <div className="h-3 bg-rose-50 rounded w-1/2" />
                        <div className="h-3 bg-rose-50 rounded w-1/4" />
                      </div>
                      <div className="w-24 h-10 bg-rose-50 rounded" />
                    </div>
                  ))}
                </div>
              ) : myBooks.length === 0 ? (
                <div className="p-6 bg-white rounded-xl shadow-sm text-gray-500">
                  You haven't listed any books yet. <button className="ml-2 btn btn-ghost btn-sm text-rose-600" onClick={()=>window.location.href='/sell'}>List a book</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myBooks.map((b) => (
                    <div key={b._id || b.id} className="bg-white rounded-2xl shadow p-4 flex gap-4 items-stretch">
                      <div className="w-28 h-36 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                        {b.image ? (
                          <img src={b.image} alt={b.title || b.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-rose-300">No Image</div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-rose-600">{b.title || b.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{b.title?.length > 120 ? `${b.title.slice(0, 120)}...` : b.title}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-rose-600 font-bold">{formatPrice(b.price)}</div>
                            <div className="text-xs text-gray-400 mt-1">{b.category}</div>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center gap-3">
                          <button
                            onClick={() => (window.location.href = `/buy/${b._id}`)}
                            className="btn btn-rose btn-sm text-white"
                          >
                            View / Buy
                          </button>
                          <button
                            onClick={() => (window.location.href = `/sell?edit=${b._id}`)}
                            className="btn btn-ghost btn-sm"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column: Blogs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-rose-600">My Blogs</h2>
                <div className="text-sm text-gray-500">{myBlogs.length}</div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="animate-pulse p-4 bg-white rounded-xl shadow-sm">
                      <div className="h-5 w-3/4 bg-rose-50 rounded mb-3"></div>
                      <div className="h-3 w-full bg-rose-50 rounded mb-2"></div>
                      <div className="h-3 w-5/6 bg-rose-50 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : myBlogs.length === 0 ? (
                <div className="p-6 bg-white rounded-xl shadow-sm text-gray-500">
                  You haven't written any blogs yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myBlogs.map((blog) => (
                    <div key={blog._id || blog.id} className="bg-white p-4 rounded-xl shadow-sm">
                      <h3 className="font-semibold text-rose-600">{blog.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mt-2">{blog.content}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          onClick={() => (window.location.href = `/blog/${blog._id}`)}
                          className="btn btn-ghost btn-sm"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => (window.location.href = `/blog/edit/${blog._id}`)}
                          className="btn btn-outline btn-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Small CTA */}
              <div className="mt-6 p-4 bg-white rounded-xl shadow-sm text-center">
                <p className="text-sm text-gray-600">Want to add more content?</p>
                <div className="mt-3 flex justify-center gap-3">
                  <button onClick={() => (window.location.href = "/sell")} className="btn btn-rose btn-sm text-white">List a Book</button>
                  <button onClick={() => (window.location.href = "/blog/new")} className="btn btn-ghost btn-sm">Write a Blog</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent comments/ratings placeholder */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-rose-600 mb-3">Recent Comments & Ratings</h3>
            <div className="p-4 bg-white rounded-xl shadow-sm text-gray-500">
              <p>Comments and ratings will appear here if you enable storing them in user activity.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
