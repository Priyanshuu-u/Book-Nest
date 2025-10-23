import React, { useEffect, useState } from "react";
import axios from "axios";
const backendurl = "https://book-nest-backend-7lyo.onrender.com";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

/**
 * Robust Profile dashboard:
 * - Tries multiple localStorage/sessionStorage keys and common response shapes
 * - Listens for storage events to update if user logs in/out in another tab
 * - Logs what it finds so you can debug stored user shapes
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
    } catch (e) {
      return raw;
    }
  };

  // Try to extract a user object from many common storage shapes
  const findStoredUser = () => {
    const candidateKeys = [
      "user",
      "Users",        // <-- added to match your stored key
      "authUser",
      "currentUser",
      "profile",
      "loggedUser",
      "persist:user",
      "persist:root",
      "auth"
    ];

    for (const key of candidateKeys) {
      const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (!raw) continue;
      const parsed = tryParse(raw);
      // If parsed is the actual user object
      if (parsed && typeof parsed === "object") {
        // Common shapes:
        // 1) parsed is the user: { _id, fullname, email }
        if (parsed._id || parsed.id) {
          console.debug(`Profile: found user under key "${key}"`, parsed);
          return parsed;
        }
        // 2) parsed is { user: {...} }
        if (parsed.user && (parsed.user._id || parsed.user.id)) {
          console.debug(`Profile: found user under key "${key}.user"`, parsed.user);
          return parsed.user;
        }
        // 3) parsed is { data: { user: {...} } } or axios-like resp
        if (parsed.data && parsed.data.user && (parsed.data.user._id || parsed.data.user.id)) {
          console.debug(`Profile: found user under key "${key}.data.user"`, parsed.data.user);
          return parsed.data.user;
        }
        // 4) nested common case: persist:root might contain auth -> user
        if (parsed.auth && parsed.auth.user && (parsed.auth.user._id || parsed.auth.user.id)) {
          console.debug(`Profile: found user under key "${key}.auth.user"`, parsed.auth.user);
          return parsed.auth.user;
        }
      }
    }

    // Nothing found
    console.debug("Profile: no user found in local/session storage keys:", Object.keys(localStorage));
    return null;
  };

  // Initialize user from storage (and whenever storage changes)
  useEffect(() => {
    const u = findStoredUser();
    setUser(u);
    setLoading(false);

    const onStorage = (e) => {
      // Re-evaluate stored user when storage changes
      const updated = findStoredUser();
      setUser(updated);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // fetch all books then filter by userId
        const booksResp = await axios.get(`${backendurl}/book`);
        const books = booksResp.data || [];
        const filteredBooks = books.filter(
          (b) => {
            const uid = user._id || user.id;
            if (!uid) return false;
            if (!b.userId) return false;
            if (typeof b.userId === "object") {
              return b.userId._id === uid || b.userId === uid;
            }
            return b.userId === uid;
          }
        );
        setMyBooks(filteredBooks);

        // fetch blogs and filter by author
        const blogsResp = await axios.get(`${backendurl}/blog`);
        const blogs = blogsResp.data || [];
        const filteredBlogs = blogs.filter((blog) => {
          const uid = user._id || user.id;
          if (!uid) return false;
          if (!blog.author) return false;
          if (typeof blog.author === "string") return blog.author === uid;
          if (typeof blog.author === "object") {
            return blog.author._id === uid || blog.author === uid || blog.author.fullname === user.fullname;
          }
          return false;
        });
        setMyBlogs(filteredBlogs);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="mt-4 text-gray-600">You are not logged in.</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>Debug info (open console):</p>
          <p>Look for "Profile: found user" or "Profile: no user found" messages in console.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Dashboard</h2>

      <section className="mb-6">
        <h3 className="text-lg font-medium">My Details</h3>
        <div className="mt-3 bg-white p-4 rounded shadow-sm">
          <p><strong>Name:</strong> {user.fullname}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user._id || user.id}</p>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-medium">My Listed Books</h3>
        {loading ? (
          <div className="mt-3">Loading...</div>
        ) : myBooks.length === 0 ? (
          <div className="mt-3 text-gray-500">You haven't listed any books yet.</div>
        ) : (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myBooks.map((b) => (
              <div key={b._id || b.id} className="bg-white p-3 rounded shadow">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 bg-gray-100 overflow-hidden rounded">
                    {b.image ? (
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{b.title || b.name}</div>
                    <div className="text-sm text-gray-500">₹ {b.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-medium">My Blogs</h3>
        {loading ? (
          <div className="mt-3">Loading...</div>
        ) : myBlogs.length === 0 ? (
          <div className="mt-3 text-gray-500">You haven't posted any blogs yet.</div>
        ) : (
          <div className="mt-3 space-y-3">
            {myBlogs.map((blog) => (
              <div key={blog._id || blog.id} className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold">{blog.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{blog.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-medium">Recent Comments / Ratings</h3>
        <div className="mt-3 text-gray-500">If you store comments/ratings in a dedicated endpoint, add a fetch here to show them.</div>
      </section>
    </div>
  <Footer/>
      </>
  );
};

export default Profile;
