import React from "react";
import { Link } from "react-router-dom";

/**
 * Cards component
 * - Accepts props.books or props.data (keeps compatibility)
 * - Fixed card height and image container so all cards look identical
 * - Button placed with mt-auto so it stays at the bottom
 */
const Cards = (props) => {
  const items = props.books || props.data || [];

  if (!items || items.length === 0) {
    return <div className="text-center p-6">No items found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((book) => {
        const id = book._id || book.id;
        const title = book.title || book.name || "Untitled";
        const author = book.author || "Unknown";
        const price = book.price !== undefined ? book.price : book?.pricing || "N/A";
        const imageSrc = book.image || book.thumbnail || "";

        return (
          <div
            key={id}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[420px] md:h-[420px]"
          >
            {/* Image container with fixed height so images don't resize the card */}
            <div className="h-56 w-full overflow-hidden bg-gray-100">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <div>
                <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{author}</p>
              </div>

              <div className="mt-3 text-gray-800 font-medium">₹ {price}</div>

              {/* Button area sticky to bottom of card */}
              <div className="mt-auto pt-4">
                <div className="flex gap-2">
                  <Link
                    to={`/book/${id}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-md text-center transition"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => {
                      // If your app has a "get" flow, call your handler here
                      // or navigate to a buy page
                      window.location.href = `/book/${id}`;
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition"
                  >
                    Get Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Cards;
