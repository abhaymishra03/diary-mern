const express = require("express");
const {authRoute}= require("./routes/authRoute");
const {diaryRoute}= require("./routes/diaryRoute");
const app = express();

app.use(express.json());

app.use("/api/auth",authRoute);
app.use("/api/diary",diaryRoute);

module.exports=app;

