const jwt = require('jsonwebtoken');
const { findById } = require('../models/User.model');
const userModel = require('../models/User.model')

const isAuthenticated = async (req,res,next) => {
    let token;
    const { authorization } = req.headers

    if(authorization && authorization.startsWith("Bearer")) {
        try{
            token = authorization.split(" ")[1]

            const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY)

            req.user = await userModel.findById(_id)

            if(req.user.isVerified){
                next()
            }
            else{
                res.status(401).json({
                    status:false, message:"Your email is not verified."
                })
            }
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

const isVerified = async (req,res,next) => {
    let token;
    const { authorization } = req.headers;

    if(authorization && authorization.startsWith("Bearer")){
        try{
            token = authorization.split(" ")[1]

            const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            const user = await userModel.findById(_id)

            if(user.isVerified === true){
                next()
            }
            else{
                res.status(401).json({
                    status:false, message:"Unauthorized Access."
                })
            }
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
    isAuthenticated,
    isVerified
}