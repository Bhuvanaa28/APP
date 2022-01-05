require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
const userRouter = require("./routes/user.routes.js");
app.use('/users', userRouter);

const mongoose = require("mongoose");
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Successfully connected to mongo.");
})
.catch((err) => {
    console.log("Error connecting to mongo.", err);
});

const port = process.env.PORT || 5000;

app.get('/ping', (req, res) => res.send('Server Running!'));

app.all('*', (req, res) => {
    res.status(404);
    res.send('ERROR 404!');
  });
 
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
