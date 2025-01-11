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
      toast.error('Please login to sell a book');
      return;
    }

    // Use userInfo._id instead of authUser._id
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
          userId: userInfo._id  // Use userInfo._id here
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo._id}` // Add Authorization header
          }
        }
      );
      
      console.log('Book added:', response.data);
      toast.success('Book Successfully Added!');
      
      // Clear the form
      setName('');
      setTitle('');
      setPrice('');
      setCategory('');
      setAvailable('');
      setImage('');
      setAuthor('');
      setComments('');
      
    } catch (error) {
      console.error('Error selling book:', error);
      const errorMessage = error.response?.data?.message || 'Error adding book. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Rest of your component code remains the same...
