
// Imports & Initializations:
const express = require('express');
const app = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const http = require('http').Server(app);
const socket = require('socket.io')(http);

// Initializations:
const mongoConnectionString = 'mongodb+srv://ncookie:mmJQWPhqoa7k7aVC@cluster0.sapyp.mongodb.net/ChatDB?retryWrites=true&w=majority';
const port = 3000;

// Express Setup:
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({ secret: 'gyraMaisSessionCookie' }));

// Express File Routing:
app.get('/index.css', function(req, res) {
  res.sendFile('/style/index.css', {root: '.'});
});
app.get('/login.css', function(req, res) {
  res.sendFile('/style/login.css', {root: '.'});
});
app.get('/favicon.png', function(req, res) {
  res.sendFile('/favicon.png', {root: '.'});
});

// Starting Express Server:
http.listen(port, function() {
  console.log('Express server is up on port ' + port + '.');
});

// Starting MongoDB Connection:
MongoClient.connect(mongoConnectionString, { useUnifiedTopology: true })
  .then(client => {

    // Printing on Successful Connection:
    console.log('Successfully connected to MongoDB.');

    // Initializations:
    const db = client.db('ChatDB');
    const messages = db.collection('messages');

    // Logging In:
    app.post('/login', (req,res) => {
      var session = req.session;
      session.user = req.body.user;
      res.redirect('/');
    });

    // Logging Out:
    app.post('/logout', (req,res) => {
      req.session.destroy();
      res.redirect('/');
    });

    // Inserting Message:
    app.post('/newMessage', (req,res) => {
      messages.insertOne(req.body)
        .then(result => { socket.emit('messageSent') })
        .catch(console.error);
    });

    // Reading Messages:
    app.get('/', (req, res) => {
      var session = req.session;
      if(session.user) {
        db.collection('messages').find().toArray()
        .then(results => { res.render('index.ejs', { messages: results, user: session.user }) })
        .catch(console.error);
      } else {
        res.render('login.ejs');
      }
    });

  }).catch(console.error);