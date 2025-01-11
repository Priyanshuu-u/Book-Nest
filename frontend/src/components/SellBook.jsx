import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
const SellBook = ({ authUser }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState('');
  const [image, setImage] = useState('');
  const [author, setAuthor] = useState('');
  const [comments, setComments] = useState('');
const url = "https://book-nest-backend-7lyo.onrender.com";
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userInfo = JSON.parse(localStorage.getItem('Users'));

    if (!userInfo) {
      console.error('User is not logged in');
      return;
    }
    try {
      const response = await axios.post(
        `${url}/sell`,
        {
          name,
          title,
          price,
          category,
          available,
          image,
          author,
          comments,
          userId: authUser._id, // Sending the logged-in user's ID
        },
        {
          withCredentials: true, // Send cookies with the request (needed for session authentication)
        }
      );
      console.log('Book added:', response.data);
      toast.success('Successfully Added!')
    } catch (error) {
      console.error('Error selling book:', error);
      toast.error(error)
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl text-center font-bold text-pink-500 mb-8">Sell Your Book</h2>
      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Book Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Book Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control mb-4">
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input input-bordered w-full"
              required
            />
          </div>
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Availability"
              value={available}
              onChange={(e) => setAvailable(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control mb-4">
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>
          <div className="form-control mb-4">
            <textarea
              placeholder="Comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="textarea textarea-bordered w-full"
            />
          </div>
          <div className="form-control mt-4">
            <button type="submit" className="btn btn-pink w-full">
              Sell Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellBook;
