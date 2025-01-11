import Book from "../model/book.model.js";

export const getBook = async (req, res) => {
  try {
    const book = await Book.find();
    res.status(200).json(book);
  } catch (error) {
    console.log("error:" + error);
    res.status(500).json(error);
  }
};
export const getBookById = async (req, res) => {
  const bookId = req.params.id;
  
  try {
    const book = await Book.findById(bookId); // Fetch book by ID from DB
    if (!book) {
      return res.status(404).send({ message: 'Book not found' });
    }
    res.status(200).json(book); // Return book details as JSON
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).send({ message: 'Error fetching book details' });
  }
};

export const getBooksByUser = async (req, res) => {
  try {
    const userId = req.headers['authorization']?.split(' ')[1]; // Extract userId from Authorization header
    if (!userId) {
      return res.status(401).json({ error: 'User not logged in' });
    }

    // Find all books associated with this userId
    const books = await Book.find({ userId });
    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user books' });
  }
};


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
