import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

/**
 * Buy page - simplified UI and correct backend endpoints
 * - Fixed: fetchBookDetails now calls /book/buy/:id (backend mounts book routes at /book)
 * - Ratings fetch remains /ratings/:id (ratings router is mounted at '/')
 * - Improved error logging for 404/other responses
 */

const backendUrl = "https://book-nest-backend-7lyo.onrender.com";

function Buy({ authUser }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [processing, setProcessing] = useState(false);

  // fallback to read stored user if authUser prop is not supplied
  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem("Users") || localStorage.getItem("user") || null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) {
        console.warn("Buy: no id in URL params");
        return;
      }
      try {
        // NOTE: backend book routes are mounted at /book, so use /book/buy/:id
        const res = await axios.get(`${backendUrl}/book/buy/${id}`);
        setItem(res.data);
      } catch (err) {
        // Log useful diagnostic info
        if (err.response) {
          console.error("Error fetching book details:", err.response.status, err.response.data);
        } else {
          console.error("Error fetching book details:", err.message);
        }
      }
    };

    const fetchRatings = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`${backendUrl}/ratings/${id}`);
        setRatings(res.data || []);
      } catch (err) {
        if (err.response) {
          console.error("Error fetching ratings:", err.response.status, err.response.data);
        } else {
          console.error("Error fetching ratings:", err.message);
        }
      }
    };

    if (id) {
      fetchBookDetails();
      fetchRatings();
    }
  }, [id]);

  // load Razorpay checkout script
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // handle buy flow: create order on backend -> open Razorpay -> verify on backend
  const handleBuyNow = async () => {
    const user = authUser || getStoredUser();
    if (!user || !user._id) {
      alert("Please login before making a purchase.");
      return;
    }
    if (!item) {
      alert("Book data not loaded yet.");
      return;
    }

    try {
      setProcessing(true);

      // Create order on backend
      const amount = Number(item.price) || 0;
      const createResp = await axios.post(`${backendUrl}/create-order`, {
        bookId: id,
        userId: user._id,
        amount: amount * 100 // paise
      });

      const order = createResp.data;
      if (!order || !order.id) {
        console.error("Invalid order response:", createResp.data);
        alert("Could not create order. Try again later.");
        setProcessing(false);
        return;
      }

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert("Failed to load Razorpay SDK. Check network or try later.");
        setProcessing(false);
        return;
      }

      const options = {
        key: order.key || import.meta.env.VITE_RAZORPAY_KEY || "",
        amount: order.amount || amount * 100,
        currency: order.currency || "INR",
        name: "BookNest",
        description: item.title || item.name || "Book purchase",
        order_id: order.id,
        prefill: {
          name: user.fullname || "",
          email: user.email || ""
        },
        theme: { color: "#F472B6" },
        handler: async (response) => {
          try {
            await axios.post(`${backendUrl}/verify-payment`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookId: id,
              userId: user._id
            });
            alert("Payment successful! Thank you for your purchase.");
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment succeeded but verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setProcessing(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error starting payment:", err);
      alert("Failed to start payment. Check console for details.");
      setProcessing(false);
    }
  };

  // Submit rating
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    const user = authUser || getStoredUser();
    if (!user || !user._id) {
      alert("Please login to rate.");
      return;
    }
    if (!userRating || !userComment) {
      alert("Please enter rating and comment.");
      return;
    }

    const payload = {
      bookId: id,
      userId: user._id,
      rating: Number(userRating),
      comment: userComment
    };

    try {
      await axios.post(`${backendUrl}/ratings/${id}`, payload);
      setRatings((prev) => [...prev, payload]);
      setUserRating(0);
      setUserComment("");
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Failed to submit rating.");
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Book Details */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 border border-rose-100">
          {item ? (
            <>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-56 h-72 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-extrabold text-rose-600 mb-2">{item.name}</h1>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-4">{item.title}</p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl font-bold text-rose-600">{item.price === 0 ? "Free" : `₹${item.price}`}</div>
                    <div className="text-sm text-gray-400 px-2 py-1 rounded-md border border-rose-100">{item.category}</div>
                    <div className="text-sm text-gray-500">Author: <span className="text-gray-700">{item.author}</span></div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBuyNow}
                      disabled={processing}
                      className="btn btn-rose px-6 py-3 text-white"
                    >
                      {processing ? "Processing..." : (item.price === 0 ? "Get for Free" : `Buy Now — ₹${item.price}`)}
                    </button>

                    <button
                      onClick={() => window.location.href = `/sell?owner=${item.userId}`}
                      className="btn btn-ghost"
                    >
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>

              {/* Ratings & comments */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-rose-600 mb-3">Ratings & Comments</h3>
                {ratings.length > 0 ? (
                  <ul className="space-y-4">
                    {ratings.map((r, idx) => (
                      <li key={idx} className="bg-rose-50 rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{r.userId?.fullname || r.userId || "Anonymous"}</div>
                            <div className="text-sm text-gray-600">Rating: {r.rating} / 5</div>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{r.comment}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No ratings yet. Be the first to rate this book.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">Loading book details...</div>
          )}
        </div>

        {/* Rating form / Purchase info */}
        <div className="bg-white rounded-2xl shadow p-6 border border-rose-100">
          <div className="text-center mb-4">
            <h2 className="text-lg font-semibold text-rose-600">Your Review</h2>
            <p className="text-sm text-gray-500">Share your thoughts about this book</p>
          </div>

          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={userRating}
                onChange={(e) => setUserRating(Number(e.target.value))}
                className="input input-bordered w-full mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows="4"
                className="textarea textarea-bordered w-full mt-2"
              />
            </div>

            <button type="submit" className="btn btn-rose w-full">
              Submit Rating
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Buy;
