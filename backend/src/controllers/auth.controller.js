const {User} = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require("../configs/config")


const register = async (req,res) => {

    const {username,email,password} = req.body;

    if(!username || !email || !password) {

        return res.status(400).json({
            message : "All fields are required !",
        })
    }


    if(await User.findOne({email: email}) || await User.findOne({username: username})) {
         return res.status(400).json({
                message : "User already exists !",
    })

}

    


    const hash = await bcrypt.hash(password,10);

    const user = new User({
        username : username,
        email : email,
        password : hash
    }); 
    await user.save();

    const accessToken = jwt.sign({id: user._id},JWT_SECRET, {expiresIn: "10m"});
    const refreshToken = jwt.sign({id: user._id},JWT_SECRET, {expiresIn: "7d"});
    

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
        message : "User registered successfully !",
        user : {    
            username : user.username,
            email : user.email,
            accessToken : accessToken,
        }
    });


    
}

const login = async (req,res) => {
    const {email,password} = req.body || {};

    if(typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
        return res.status(400).json({
            message : "All fields are required !",
        })
    }

    const user = await User.findOne({email: email.trim().toLowerCase()});

    if(!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({
            message : "Invalid email or password !",
        })
    }

    const accessToken = jwt.sign({id: user._id},JWT_SECRET, {expiresIn: "10m"});
    const refreshToken = jwt.sign({id: user._id},JWT_SECRET, {expiresIn: "7d"});

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
        message : "User logged in successfully !",
        user : {
            username : user.username,
            email : user.email,
            accessToken : accessToken,
        }
    });
}

const logout = (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.status(200).json({
        message: "User logged out successfully !",
    });
}
const refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token not found !",
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const accessToken = jwt.sign({ id: decoded.id }, JWT_SECRET, { expiresIn: "10m" });     

        return res.status(200).json({
            message: "Access token refreshed successfully !",
            accessToken: accessToken,
        });
    }
    catch (error) {
        return res.status(403).json({
            message: "Invalid refresh token !",
        });
    }    
    
}



module.exports={register, login, logout, refreshToken};