const jwt = require("jsonwebtoken");
const { Diary } = require("../models/diary.model");
const { JWT_SECRET } = require("../configs/config");

const createDiary = async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            message: "Title and content are required!",
        });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please Login to create a diary entry!",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const diary = new Diary({
            title,
            content,
            user: userId,
        });
        await diary.save();

        return res.status(201).json({
            message: "Diary created successfully!",
            diary,
        });
    } catch (error) {
        return res.status(403).json({
            message: "Invalid token!",
        });
    }
};

const getDiaries = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Please Login to view diary entries!",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const id = decoded.id;

        const diaries = await Diary.find({ user: id }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Diaries fetched successfully!",
            diaries,
        });
    } catch (error) {
        return res.status(403).json({
            message: "Invalid token!",
            error: error.message,
        });
    }
};

module.exports = { createDiary, getDiaries };
