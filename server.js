const express = require('express')
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
let broadcasterAvailable = false;
let Bid;
let Bname;
const dotenv = require("dotenv");
require("path")
dotenv.config({ path: "config.env" });
const { MongoClient } = require('mongodb');
const mongoURI = process.env.MONGO_URI; // Replace with your URI
const dbName = process.env.DB; // Replace with your database name
const collectionName = process.env.COL; // Replace with your collection name
let db, credentialsCollection;

MongoClient.connect(mongoURI)
  .then((client) => {
    db = client.db(dbName);
    credentialsCollection = db.collection(collectionName);
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(
  session({
    secret: 'your_secret_key', // Replace with a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 
    }
  })
);

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.redirect('/Viewer')
})
var userC = {}


function ensureAdmin(req, res, next) {
  if (req.cookies.broadcaster) {
    next();
  } else {
    res.redirect('/Broadcaster/login'); 
  }
}


app.get('/Broadcaster/login', (req, res) => {
  if (req.cookies.broadcaster) {
    return res.redirect('/Broadcaster'); 
  }
  res.render('login')
});


app.post('/broadcaster/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await credentialsCollection.findOne({ username });
    if (admin && admin.password === password) {
      res.cookie('broadcaster', admin.username, { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true 
      });
      // res.cookie('broadcaster', true, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
      // res.cookie('broadcasterNAME', admin, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
      res.redirect('/Broadcaster');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/admin/change-credentials', ensureAdmin, (req, res) => {
  res.send(`
    <button class="leave-B" id="leave-BTN" onclick="location.href='/Broadcaster'"><img id="leave-img" src="/img/logout.png"></button>
    <form method="POST" action="/admin/change-credentials">
      <h1>Change Admin Credentials</h1>
      <label for="newUsername">New Username:</label>
      <input type="text" id="newUsername" name="newUsername" required>
      <label for="newPassword">New Password:</label>
      <input type="password" id="newPassword" name="newPassword" required>
      <button type="submit">Update</button>
    </form>
  `);
});

app.post('/admin/change-credentials', ensureAdmin, async (req, res) => {
  const { newUsername, newPassword } = req.body;
  try {
    if (newUsername && newPassword) {
      res.cookie('broadcaster', newUsername, { 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true 
      });
      await credentialsCollection.updateOne(
        {},
        { $set: { username: newUsername.trim(), password: newPassword.trim() } },
        { upsert: true }
      );
      res.send(`
        <h1>Credentials Updated Successfully</h1>
        <a href="/Broadcaster">Go Back</a>
      `);
    } else {
      res.status(400).send('Invalid input');
    }
  } catch (err) {
    console.error('Error updating credentials:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/broadcaster/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Error logging out');
    res.clearCookie('broadcaster');
    res.redirect('/Broadcaster/login');
  });
});




app.get('/Broadcaster',ensureAdmin,(req, res) => {

  res.render('LivePage', { roomId: 'live-hall',role: 'Broadcaster',name: req.cookies.broadcaster })
})
app.get('/Viewer', (req, res) => {
  if(!req.cookies.username){
    res.redirect('/new-user')
  }else{

    res.cookie('viewer', true, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.render('room', { roomId: 'live-hall',role: 'Viewer' })
  }
})
app.get('/Leave', (req,res) => {
  if(req.cookies.broadcaster){
    return res.render('endB')
  }
  if (req.cookies.viewer){
    return res.render('end')
  }
  else{
    res.redirect('/Viewer')
  }
  
})
app.get('/new-user', (req,res) => {
  if(!req.cookies.username){
    res.render('new')
  }else{
    res.redirect('/Viewer')
  }
})

app.get('/:any', (req,res) => {
  res.redirect('/Viewer')
})
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, role, Wusername) => {
    
    if(role == 'watcher'){
      if(broadcasterAvailable == false){
        socket.emit('Bstats', false)
      }else{
        socket.emit('Bstats', true)
        socket.emit('Bname', Bname)
      }

    }
    if(role == 'broadcaster'){
      Bid = userId;
      Bname = Wusername;
      if(broadcasterAvailable == false){
        broadcasterAvailable = true
      }
      socket.to(roomId).broadcast.emit('Bname', Bname)
      console.log("BroadcasterAvailable : "+ broadcasterAvailable)
      console.log("BroadcasterID : "+Bid)
    }
    if(role == 'watcher'){
      console.log(userId,role,Wusername)
    }
    socket.join(roomId)
    if(role == 'watcher'){
      socket.to(roomId).broadcast.emit('user-connected', userId, role, Wusername)
      userC[Wusername] = {Wusername,userId};
      console.log(Object.keys(userC))
      console.log('Live Viewers:' + Object.keys(userC).length)
      socket.to(roomId).broadcast.emit('usersCount', Object.keys(userC))
    }else{
      socket.to(roomId).broadcast.emit('user-connected', userId, role)
    }

    socket.on('initiateReload', () => {
      socket.to(roomId).broadcast.emit('Freload')

    })

    socket.on('videoOFF', (data) => {
      socket.to(roomId).broadcast.emit('Vimg', data)
    })
    socket.on('audioOFF', (data) => {
      socket.to(roomId).broadcast.emit('Aimg', data)
    })

    socket.on('disconnect', () => {
      if(userId == Bid){
        broadcasterAvailable = false
        Bid = ''
        Bname = ''
        console.log(broadcasterAvailable)
        console.log('Broadcaster Left!!')
        socket.to(roomId).broadcast.emit('Bstats', false)
      }
      if(Wusername){
        delete userC[Wusername]
        socket.to(roomId).broadcast.emit('usersCount', Object.keys(userC))
      }
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(3000)