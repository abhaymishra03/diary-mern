const User = require('../models/user.model');

const register = async (req,res) => {

    const {username,email,password} = req.body;

    if(!username || !email || !password) {

        return res.status(400).json({
            message : "All fields are required !",
        })
    }

    User.findOne({email: email}).then((user) => {
        if(user) {
            return res.status(400).json({
                message : "User already exists !",
            })
        }

    });

    User.findOne({username: username}).then((user) => {
        if(user) {
            return res.status(400).json({
                message : "Username already exists !",
            })
        }
    });


    const hash = await bcrypt.hash(password,10);

    const user = new User({
        username : username,
        email : email,
        password : hash
    }); 
    const accessToken = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "10m"});
    const refreshToken = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});
    

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


module.exports={register};