const jwt = require('jsonwebtoken')
const userModel = require('../models/User.model')

const isAuthenticated = async (req,res,next) => {
    let token;
    const { authorization } = req.headers

    if(authorization && authorization.startsWith("Bearer")) {
        try{
            token = authorization.split(" ")[1]

            const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY)

            req.user = await userModel.findById(_id)

            next()
        }
        catch(err){
            res.status(401).json({
                status:false, message:"Unauthorized Access."
            })
        }
    }
    if (!token) {
        res.status(401).json({
            status:false, message:"No Token Provided."
        })
    }
}

module.exports = {
    isAuthenticated
}