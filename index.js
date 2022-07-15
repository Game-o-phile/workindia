const express = require('express')
const app = express();
require('dotenv/config');

app.use(express.urlencoded({ extended: false }))
app.use(express.json());

const port = process.env.PORT;

const userRouter = require('./routes/user.routes');

app.use('/app', userRouter);


app.listen(port, () => {
    console.log("Server connection successfull");
});