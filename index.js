const express = require('express')
const cors = require('cors')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



var serviceAccount = require("./config/bruj-al-arab-16f02-firebase-adminsdk-yxfen-f1393897cf.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fltsf.mongodb.net/project2?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(express.json())
app.use(cors())
const port = 5000


client.connect(err => {
  const collection = client.db("burjAlArab").collection("product");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body
    collection.insertOne(newBooking)
      .then(result => {
        res.send(result.insertCount > 0)
      })
    console.log(req.body)
  })

  app.get('/bookings', (req, res) => {
    // console.log(req.headers.authorization)
    const bearer = req.headers.authorization
    if (bearer && bearer.startsWith('Bearer ')) {
      const tokenId = bearer.split(' ')[1]
      admin.auth().verifyIdToken(tokenId)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email
          console.log(tokenEmail, queryEmail)
          if (tokenEmail == queryEmail) {
            collection.find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents)
              })
          }
          else {
            res.status(401).send('un-authorize details')
          }
        })
        .catch((error) => {
          // Handle error
        });
    }
    else {
      res.status(401).send('un-authorize details')
    }
  })


});


app.get('/', (req, res) => {
  res.send('hello')
})

app.listen(port, () => console.log(`listening from port "localhost/${port}"`))