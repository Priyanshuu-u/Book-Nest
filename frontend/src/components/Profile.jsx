import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ authUser }) => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
const url = "https://book-nest-backend-7lyo.onrender.com";
  useEffect(() => {
    const fetchBooks = async () => {
        try {
          const response = await axios.get(`{url}/book/profile`, {
            headers: {
              Authorization: `Bearer ${authUser._id}`,
            },
            withCredentials: true,
          });
          setBooks(response.data);
        } catch (error) {
          console.error('Error fetching books:', error);
        }
      };
      
  }, [authUser]);

  return (
    <div className="profile-page p-8">
      <h2 className="text-4xl text-center font-bold text-pink-500 mb-12">Your Profile</h2>
      
      {/* User Info Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 max-w-md mx-auto">
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">Hello, {authUser.fullname}</h3>
        <p className="text-gray-600 mb-4">Email: {authUser.email}</p>
        <p className="text-gray-600">Total Books Listed: {books.length}</p>
      </div>

      {/* Books List Section */}
      <div className="books-list grid gap-6 lg:grid-cols-3 md:grid-cols-2">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          books.map((book) => (
            <div key={book._id} className="book-item bg-white p-4 rounded-lg shadow-md">
              <img src={book.image} alt={book.title} className="h-40 w-full object-cover rounded-md mb-4" />
              <h3 className="text-xl font-bold text-gray-700">{book.title}</h3>
              <p className="text-gray-500 mb-2">Author: {book.author}</p>
              <p className="text-gray-500 mb-2">Category: {book.category}</p>
              <p className="text-pink-500 font-semibold">Price: ${book.price}</p>
              <p className="text-gray-600 mt-4">{book.comments}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
