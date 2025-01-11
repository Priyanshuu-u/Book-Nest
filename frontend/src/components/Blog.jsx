import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthProvider'; 
import axios from 'axios';

function Blog() {
  const [authUser] = useAuth(); 
  const [blogs, setBlogs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const url = "https://book-nest-backend-7lyo.onrender.com";
  // Fetch blogs when user is logged in or when blogs need to be reloaded
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`{url}/blog`);
        setBlogs(response.data);
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      }
    };
    if (authUser) {
      fetchBlogs();
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) {
      alert('You need to be logged in to create a blog post');
      return;
    }

    try {
      const response = await axios.post(url+'/blog', {
        title,
        content,
        author: authUser._id, 
      });
      setBlogs([response.data, ...blogs]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Failed to post blog:", error);
    }
  };

  const handleEdit = (blog) => {
    setEditMode(true);
    setEditingBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`{url}/blog/${editingBlog._id}`, {
        title,
        content,
      });
      setBlogs(blogs.map((b) => (b._id === editingBlog._id ? response.data : b)));
      setEditMode(false);
      setEditingBlog(null);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error("Failed to edit blog:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`{url}/blog/${id}`);
      setBlogs(blogs.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Section for Blogs */}
      <div className="col-span-2">
        <h1 className="text-pink-500 text-3xl font-bold mb-4">Community Blog</h1>
        {blogs.length === 0 ? (
          <p className="text-center text-pink-500">No posts yet. Be the first to share your thoughts!</p>
        ) : (
          blogs.map((blog) => (
            <div key={blog._id} className="card bg-pink-50 shadow-lg hover:shadow-xl transition-all duration-300 mb-4 p-4">
              <h3 className="text-pink-500 text-xl font-semibold">{blog.title}</h3>
              <p className="text-gray-700 mb-2">{blog.content}</p>
              <p className="text-sm text-gray-400">By {blog.author.fullname}</p>

              {authUser && authUser._id === blog.author._id && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="btn btn-sm btn-outline btn-pink"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="btn btn-sm btn-outline btn-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Right Section for Creating or Editing Posts */}
      <div className="bg-pink-100 p-6 rounded-lg shadow-lg">
        <h2 className="text-pink-500 font-semibold text-xl mb-4">{editMode ? "Edit Post" : "Create a Post"}</h2>
        {authUser && (
          <form onSubmit={editMode ? handleEditSubmit : handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full bg-white text-pink-500 border-pink-500"
            />
            <textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea textarea-bordered w-full bg-white text-pink-500 border-pink-500"
            />
            <button type="submit" className="btn btn-pink w-full">
              {editMode ? "Save Changes" : "Add Blog Post"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Blog;
