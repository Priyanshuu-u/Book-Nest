import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Cards component that supports both:
 * - Single-card usage: <Cards item={item} />
 * - Grid usage with array:  <Cards items={books} />
 *
 * Keeps your original daisyUI styling, fixes image sizing with object-cover,
 * and ensures buttons stay aligned even when titles/descriptions differ.
 */
function Cards(props) {
  const single = props.item || null;
  const items = props.items || props.books || props.data || null;

  // Render one card (keeps your original structure & classes)
  const renderCard = (item) => {
    if (!item) return null;
    return (
      <div className="mt-4 my-4 p-3" key={item._id || item.id}>
        <div className="card bg-base-100 shadow-xl w-92 hover:scale-105 duration-200 h-90 dark:bg-slate-900 dark:text-white dark:border flex flex-col">
          {/* Fixed-height figure so images don't change card size */}
          <figure className="h-48 w-full overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </figure>

          <div className="card-body flex flex-col flex-1">
            <h2 className="card-title">
              {item.name}
              <div className="badge badge-secondary px-1 py-1 w-15 ml-2">
                {item.price} {'\u20B9'}
              </div>
            </h2>

            <p className="line-clamp-2">{item.title}</p>

            <div className="card-actions justify-between mt-auto">
              <div className="badge badge-outline">{item.category}</div>

              <div className="flex gap-2">
                {/* Keep the state-based Link you used previously */}
                

                {/* Also keep the id-based route if you use it */}
                <Link
                  to={`/buy/${item._id}`}
                  className="badge badge-outline hover:bg-pink-500 hover:text-white px-5 py-2 duration-200 cursor-pointer"
                >
                  Get Now!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If single item passed, render the single card
  if (single) {
    return renderCard(single);
  }

  // If an array is provided, render a responsive grid of cards
  if (items && Array.isArray(items)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it) => renderCard(it))}
      </div>
    );
  }

  // No items found fallback
  return <div className="text-center p-6">No items found.</div>;
}

export default Cards;
