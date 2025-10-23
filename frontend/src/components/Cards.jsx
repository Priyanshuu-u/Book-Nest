import React from "react";
import { Link } from "react-router-dom";

/**
 * Robust Cards component (keeps using daisyUI/Tailwind classes)
 * - Detects array in many common prop names (books, data, items, list, etc.)
 * - Accepts either an array directly or an object with .data = array (e.g., axios response)
 * - Fixed card height and image container so all cards look identical
 * - Uses daisyUI/Tailwind classes for buttons and layout
 */
const Cards = (props) => {
  // Try common prop names first
  let items =
    props.books ||
    props.data ||
    props.items ||
    props.booksData ||
    props.list ||
    props.products ||
    props.array ||
    props.booksList ||
    null;

  // If parent passed an axios response or object containing { data: [...] }
  if (!items && props && typeof props === "object") {
    // Check if props itself is an array (e.g., <Cards {...booksArray} /> unlikely but safe)
    if (Array.isArray(props)) {
      items = props;
    } else if (Array.isArray(props?.data)) {
      items = props.data;
    } else {
      // Fallback: find the first array value among props values
      const arrVal = Object.values(props).find((v) => Array.isArray(v));
      if (arrVal) items = arrVal;
    }
  }

  // Final graceful fallback to empty array
  if (!items || (Array.isArray(items) && items.length === 0)) {
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
            className="card bg-base-100 shadow-md rounded-lg overflow-hidden flex flex-col h-[420px]"
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
            <div className="card-body p-4 flex flex-col flex-1">
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
                    className="btn btn-primary flex-1 text-white"
                  >
                    View
                  </Link>

                  <button
                    onClick={() => {
                      // navigate to buy page (you can replace with your handler)
                      window.location.href = `/book/${id}`;
                    }}
                    className="btn btn-success"
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
