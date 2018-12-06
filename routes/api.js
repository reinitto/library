/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoose  = require('mongoose')
var Schema = mongoose.Schema
const MONGODB_CONNECTION_STRING = process.env.DB;
const db =  mongoose.connect(MONGODB_CONNECTION_STRING,{ useNewUrlParser: true }, function(err, db) { return db });

var bookSchema = new Schema({
title: {type: String, required: true},
  comments: [String],
  commentcount: Number
})

var Book= mongoose.model('books', bookSchema)

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
    Book.find({}, '-__v',(err, books)=>{
      if(err) res.send("Database error")
        else{
          res.json(books)
        }
    })
    })
    
    .post(function (req, res){
      var title = req.body.title;
    if(!title){res.send('Title required')}
    else{
    var book = new Book({
    title: title,
      comments: [],
      commentcount: 0
    }).save((err, book)=>{
      if(err) res.send("Saving error, try again")
        else {
          res.json({
            _id: book._id,
          title: book.title
          })
        }
    })}
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
    var id = req.body._id
    if(!id){
      Book.deleteMany({}, (err)=>{
        if(err) {res.send("Error occured")}
          else{
        res.send("complete delete successful")
          }
      })
    }
    else{
    Book.findByIdAndDelete(id, (err)=>{
      if(err){res.send("Book not found")}
        else {
          res.send("Book deleted")
        }
    })
      //if successful response will be 'complete delete successful'
    }
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    Book.findOne({_id: bookid}, (err, book)=>{
      if(err) res.send('no book exists')
        else {
          res.json(book)
        }
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
    if(!bookid){ res.send('Book id required')
               }else{
                Book.findOneAndUpdate(bookid, {$push: {comments:comment}, $inc:{commentcount: 1}},{new:true, select: "-__v"},(err, book)=>{
        if(err){res.send('invalid book ID')}
          else {
            console.log("Res.status: ",res.status==200)
             res.json(book) 
          
          }
      })
    
               }
    
     
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
    if(!bookid){res.send('NO id provided')}
      else {
      Book.findOneByIdAndDelete(bookid, (err)=>{
        if(err)res.send('could not find the book youre looking for')
        else {
        res.send('delete successful')
        }
      })
      
      }
      //if successful response will be 'delete successful'
    });
  
};
