export const sellBook = async (req, res) => {
  try {
    const { name, title, price, category, available, image, author, comments, userId } = req.body;

    // Enhanced validation
    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required. Please make sure you are logged in.' 
      });
    }

    if (!name || !title || !price || !category) {
      return res.status(400).json({ 
        message: 'Required fields are missing. Please fill in all required fields.' 
      });
    }

    // Create a new book document
    const newBook = new Book({
      name,
      title,
      price: Number(price), // Convert price to number
      category,
      available: available || true, // Default to true if not provided
      image: image || '', // Default to empty string if not provided
      author: author || '', // Default to empty string if not provided
      comments: comments || '', // Default to empty string if not provided
      userId
    });

    // Save the book to the database
    const savedBook = await newBook.save();

    res.status(201).json({
      message: 'Book successfully added',
      book: savedBook
    });

  } catch (error) {
    console.error('Error in sellBook:', error);
    res.status(500).json({ 
      message: 'Error selling book',
      error: error.message 
    });
  }
};
