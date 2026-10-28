const express = require("express");

const { createDiary,getDiaries } = require("../controllers/diary.controller");

const router = express.Router();


router.post("/create",createDiary);
router.get("/getDiaries",getDiaries);
module.exports = { diaryRoute: router };