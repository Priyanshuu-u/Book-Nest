import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * Profile dashboard:
 * - Reads logged user from localStorage (assumes key "user" with user object)
 * - Fetches /book and /blog, then filters by user id or author
 * - Shows user info, list of listed books, authored blogs and comments/ratings if available
 *
 * Adjust API endpoints or property checks below if your backend responses differ.
 */
const Profile = () => {
  const [user, setUser] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load user from localStorage (common pattern)
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      setUser(stored || null);
    } catch (err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 1) fetch all books then filter by userId
        const booksResp = await axios.get(`${import.meta.env.VITE_BACKEND_URL || ""}/book`);
        const books = booksResp.data || [];
        const filteredBooks = books.filter(
          (b) => (b.userId && (b.userId === user._id || b.userId === user.id))
        );
        setMyBooks(filteredBooks);

        // 2) fetch all blogs and filter by author (handle author as id or populated object)
        const blogsResp = await axios.get(`${import.meta.env.VITE_BACKEND_URL || ""}/blog`);
        const blogs = blogsResp.data || [];
        const filteredBlogs = blogs.filter((blog) => {
          // blog.author may be an id, a populated object, or a string name
          if (!blog.author) return false;
          if (typeof blog.author === "string") return blog.author === user._id || blog.author === user.id;
          if (typeof blog.author === "object") {
            return blog.author._id === user._id || blog.author._id === user.id || blog.author.fullname === user.fullname;
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
      </div>
    );
  }

  return (
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
  );
};

export default Profile;
