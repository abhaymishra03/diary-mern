const 

const register = async (req,res) => {

    const {username,email,password} = req.body;

    if(!username || !email || !password) {

        return res.status(400).json({
            message : "All fields are required !";
        })
    }


    
}


module.exports={register};