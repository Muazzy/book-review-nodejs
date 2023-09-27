const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).send(`User successfully registred with username: ${username}`);
    } else {
      return res.status(400).send(`User already exists with username: ${username}`);
    }
  }
  return res.status(400).send(`username or passowrd not provided`);
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

  res.send(JSON.stringify(books))

});


// Task 10
// //using async-await: Note this is just a example how we can use the async-await if we are calling a external api/serviece
// //Always use try catch block when dealing with promises.
// public_users.get('/', async (req, res) => {

//   try {
//     const books = await axios.get('someurl')
//     res.send(JSON.stringify(books))
//   }
//   catch (e) {
//     return res.status(500).send({ "message": "server error" })
//   }

// });


//TASK 11, 12, 13 will be done similarly the only difference will be calling the api, using try catch and using async-await


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn

  if (!isbn) return res.status(400).send('please provide ISBN Number')

  isbn = parseInt(isbn)
  if (isNaN(isbn)) return res.status(400).send('please provide a valid ISBN Number')

  const book = books[isbn]
  if (!book) return res.status(404).send(`no book found with isbn: ${isbn}`)

  res.send(book)
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author
  if (!author) res.status(400).send('please provide a authorname')

  const allBooks = Object.keys(books).map((isbn) => { return books[isbn] }) //extract the books in a array

  const filteredBooks = allBooks.filter((book) => {
    return book.author === author
  })

  if (filteredBooks.length < 1) return res.status(404).send(`No books found with author: ${author}`)

  res.send(filteredBooks)
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title
  if (!title) res.status(400).send('please provide a book title')

  const allBooks = Object.keys(books).map((isbn) => { return books[isbn] }) //extract the books in a array

  const filteredBooks = allBooks.filter((book) => {
    return book.title === title
  })

  if (filteredBooks.length < 1) return res.status(404).send(`No books found with title: ${title}`)

  res.send(filteredBooks)

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn

  if (!isbn) return res.status(400).send('please provide ISBN Number')

  isbn = parseInt(isbn)
  if (isNaN(isbn)) return res.status(400).send('please provide a valid ISBN Number')

  const book = books[isbn]
  if (!book) return res.status(404).send(`no book found with isbn: ${isbn}`)

  const reviews = book.reviews
  res.send(reviews)
});

module.exports.general = public_users;
