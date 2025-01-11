import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Buy({authUser}) {
  const { id } = useParams(); // Get the book ID from the URL
  const [item, setItem] = useState(null);  // Initialize item state
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
 const url = "https://book-nest-backend-7lyo.onrender.com";
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`${url}/buy/${id}`);
        setItem(response.data);
      } catch (error) {
        console.error("Error fetching book details:", error);
      }
    };

    const fetchRatings = async () => {
      try {
        const response = await axios.get(`${url}/ratings/${id}`);
        setRatings(response.data);
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    if (id) {
      fetchBookDetails();
      fetchRatings();
    }
  }, [id]);

  // Handle rating submission
  const handleRatingSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    if (!userRating || !userComment) {
      alert("Please provide both a rating and a comment.");
      return;
    }

    const ratingData = {
      bookId: id,
      userId:authUser._id,
      rating: userRating,
      comment: userComment,
    };

    try {
      // Send the rating data to the backend API
      await axios.post(`${url}/ratings/${id}`, ratingData);

      // Update the UI with the new rating and comment
      setRatings([...ratings, ratingData]);
      setUserRating(0); // Reset the rating input
      setUserComment(""); // Reset the comment input
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div className="container mx-auto p-5 flex flex-col gap-8 dark:bg-slate-900 dark:text-white">
      <div className="flex-1 p-6 bg-white rounded-lg shadow-lg border border-pink-500">
        {item ? (
          <>
            <h1 className="text-3xl font-bold mb-4 text-black">Title: {item.name}</h1>
            <img
              src={item.image}
              alt={item.name}
              className="w-full max-w-md mb-4 rounded-lg shadow-md"
            />
            <p className="text-lg mb-2">
              <span className="font-semibold text-gray-700">Description:</span> {item.title}
            </p>
            <p className="text-lg font-semibold text-pink-500 mb-2">
              Price: <span className="text-pink-600">{item.price} {"\u20B9"}</span>
            </p>
            <p className="text-md italic text-gray-600">Category: {item.category}</p>
            <p className="text-md italic text-gray-600">Author: {item.author}</p>
          </>
        ) : (
          <p className="text-lg font-semibold text-red-500">No item data available.</p>
        )}
      </div>
       {/* Payment Options Form */}
       <div className="flex-1 max-w-md p-6 bg-white rounded-lg shadow-lg border border-pink-500">
        <h2 className="text-xl font-bold mb-4 text-black">Payment Options</h2>

        <form className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-700">Card Number</span>
            </label>
            <input
              type="text"
              placeholder="Enter your card number"
              className="input input-bordered w-full border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-700">Expiry Date</span>
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              className="input input-bordered w-full border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-700">CVV</span>
            </label>
            <input
              type="password"
              placeholder="Enter CVV"
              className="input input-bordered w-full border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="form-control mt-4">
            <button className="btn w-full bg-pink-500 hover:bg-pink-600 text-white">
              Pay Now
            </button>
          </div>
        </form>
      </div>



      {/* Rating and Comment Section */}
      <div className="mt-8 bg-white p-4 rounded-lg shadow-md border border-pink-500">
        <h2 className="text-2xl font-semibold mb-4">Rate this Book</h2>
        <form onSubmit={handleRatingSubmit}>
          <div className="mb-4">
            <label htmlFor="rating" className="block text-lg font-medium">Rating</label>
            <input
              type="number"
              id="rating"
              value={userRating}
              onChange={(e) => setUserRating(e.target.value)}
              max="5"
              min="1"
              className="input input-bordered w-full mt-2"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-lg font-medium">Comment</label>
            <textarea
              id="comment"
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              rows="4"
              className="input input-bordered w-full mt-2"
            ></textarea>
          </div>
          <button type="submit" className="bg-pink-500 text-white rounded-md px-3 py-1 hover:bg-pink-700 duration-200 w-full">Submit Rating</button>
        </form>

        {/* Display Submitted Ratings */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold">Ratings & Comments</h3>
          {ratings.length > 0 ? (
            <ul className="mt-4">
              {ratings.map((rating, index) => (
                <li key={index} className="border-b pb-4 mb-4">
                  <p><strong>Rating:</strong> {rating.rating} / 5</p>
                  <p><strong>Comment:</strong> {rating.comment}</p>
                  <p>By: {rating.userId.fullname}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ratings yet. Be the first to rate this book!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Buy;
