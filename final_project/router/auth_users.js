const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
  username: "muazzam",
  password: "12345678"
}];

const isValid = (username) => { //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => {
  //write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }

}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) return res.status(404).json({ message: "Username or Password is empty" });

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: { username, password }
    }, process.env.jwtPrivateKey, { expiresIn: 1440 * 60 }); //valid for a day
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Username or Password is invalid" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const user = req.user.data

  //Validating user inputs first
  const comment = req.query.comment
  let rating = req.query.rating

  console.log(comment)
  console.log(rating)

  if (!comment || !rating) return res.status(400).send('comment & rating are required')

  rating = parseInt(rating)
  if (isNaN(rating) || rating < 0 || rating > 5) return res.status(400).send('rating must be a number between 0-5')

  // then fetch the book
  let isbn = req.params.isbn
  if (!isbn) return res.status(400).send('please provide ISBN Number')

  isbn = parseInt(isbn)
  if (isNaN(isbn)) return res.status(400).send('please provide a valid ISBN Number')

  const book = books[isbn]
  if (!book) return res.status(404).send(`no book found with isbn: ${isbn}`)


  let userReview = book.reviews[user.username]

  //if the user review does not already exists
  if (!userReview) {
    book.reviews[user.username] = {
      rating, comment
    }
    return res.status(200).send({
      "message": "review added",
      "data": { rating, comment }
    })
  }
  book.reviews[user.username] = {
    rating, comment
  }
  return res.status(200).send({
    "message": "review updated",
    "data": { rating, comment }
  })
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const user = req.user.data

  // then fetch the book
  let isbn = req.params.isbn
  if (!isbn) return res.status(400).send('please provide ISBN Number')

  isbn = parseInt(isbn)
  if (isNaN(isbn)) return res.status(400).send('please provide a valid ISBN Number')

  const book = books[isbn]
  if (!book) return res.status(404).send(`no book found with isbn: ${isbn}`)


  let userReview = book.reviews[user.username]

  //if the user review does not already exists
  if (!userReview) {
    return res.status(400).send({
      "message": "cannot delete, review not found!",
    })
  }

  delete book.reviews[user.username]
  if (book.reviews[user.username]) return res.status(500).send({ "message": "something went wrong while deleting the review" })
  res.status(200).send({ "message": "review deleted sucessfuly", data: userReview })
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
