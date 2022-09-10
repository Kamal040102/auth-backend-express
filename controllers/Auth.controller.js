const userModel = require('../models/User.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const transporter = require('../config/Nodemailer.config')

const register = async (req, res) => {
    const { email, password, cpassword, name, tc } = req.body;

    try {
        if (tc === false || !tc) {
            res.status(401).json({
                status: false,
                message: "Please accept terms and conditions."
            })
        }
        else {
            if (!email || !password || !cpassword || !name) {
                res.status(400).json({
                    status: false,
                    message: "All fields are required."
                })
            } else {
                const userExist = await userModel.findOne({ email })

                if (userExist) {
                    res.status(409).json({
                        status: false,
                        message: "Email already registered."
                    })
                }
                else {
                    if (password === cpassword) {
                        const salt = await bcrypt.genSalt(10)
                        const hpassword = await bcrypt.hash(password, salt)
                        
                        const newUser = new userModel({
                            name: name,
                            email: email,
                            password: hpassword
                        })
                        
                        await newUser.save()

                        const tempToken = jwt.sign({name, email}, process.env.JWT_SECRET_KEY, {expiresIn:"10m"})

                        res.status(200).json({
                            status: true,
                            message: "User registered. Verification link has been sent to your email id.",
                        })

                        await transporter.sendMail({
                            from: process.env.MAIL_ID,
                            to: email,
                            subject: "Registration Successful || Sharma Kamal",
                            html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                            <div style="margin:50px auto;width:70%;padding:20px 0">
                                <div style="border-bottom:1px solid #eee"><a href=""
                                        style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Sharma Kamal</a></div>
                                <p style="font-size:1.1em">Hi ${name},</p>
                                <p>Thank you for choosing my services. To proceed further and experience the power of my services you need to just click the button below and verify your identity.<br>
                                <b>P.S:</b>This verification button will expire in 10 minutes.
                                </p>
                                <h2
                                    style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;cursor:pointer">
                                    <a style="color:white;text-decoration:none" target="_blank" href=${process.env.CLIENT_URL}/verify/${tempToken}>Verify Your Email</a></h2>
                                <p style="font-size:0.9em;">Regards,<br />Sharma Kamal</p>
                                <hr style="border:none;border-top:1px solid #eee" />
                                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                                    <p>Sharma Kamal</p>
                                    <p>Surat</p>
                                </div>
                            </div>
                        </div>`,
                        })
                    }
                    else {
                        res.status(409).json({
                            status: false,
                            message: "Password and Confirm password should match."
                        })
                    }
                }
            }
        }
    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

const verifyEmail = async (req,res) => {
    const { token } = req.params;

    try{
        const { name, email } = jwt.verify(token, process.env.JWT_SECRET_KEY)

        const userExist = await userModel.findOne({name, email})
        if(userExist){
            await userModel.findOneAndUpdate({email, name}, {isVerified:true})

            res.status(200).json({
                status: true,
                message: "Your account is verified."
            })
        }
        else{
            res.status(400).json({
                status: false,
                message: "Not able to verify this time. Please try again later."
            })
        }
    }
    catch(err){
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            res.status(400).json({
                status: false,
                message: "All fields are required."
            })
        }
        else {
            const userExist = await userModel.findOne({ email })

            if (!userExist) {
                res.status(404).json({
                    status: false,
                    message: "Invalid Credentials."
                })
            }
            else {
                const passwordMatch = await bcrypt.compare(password, userExist.password)
                if (!passwordMatch) {
                    res.status(404).json({
                        status: false,
                        message: "Invalid Credentials."
                    })
                }
                else {
                    const token = await jwt.sign({ _id: userExist._id }, process.env.JWT_SECRET_KEY, {
                        expiresIn: "5d"
                    })
                    res.status(200).json({
                        status: true,
                        message: "User Logged In.",
                        token: token
                    })
                }
            }
        }
    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

const changePassword = async (req, res) => {
    const { password, cpassword } = req.body;

    try {
        if (!password || !cpassword) {
            res.status(400).json({
                status: false,
                message: "All fields are required."
            })
        }
        else {
            if (password === cpassword) {
                const salt = await bcrypt.genSalt(10)
                const hpassword = await bcrypt.hash(password, salt)

                const passUpdate = await userModel.findByIdAndUpdate(req.user._id, { password: hpassword })

                if (passUpdate) {
                    res.status(200).json({
                        status: true,
                        message: "Password updated Successfully."
                    })
                }
                else {
                    res.status(409).json({
                        status: false,
                        message: "Password didn't update. Please try again!."
                    })
                }
            }
            else {
                res.status(409).json({
                    status: false,
                    message: "Password and Confirm password should match."
                })
            }
        }
    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

const getUserDetail = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id)

        res.status(200).json({
            status: true,
            user
        })
    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

const resetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            res.status(400).json({
                status: false,
                message: "All fields are required."
            })
        }
        else {
            const user = await userModel.findOne({ email })

            if (user) {
                const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_KEY, { expiresIn: "15m" })
                const link = `${process.env.CLIENT_URL}/${user._id}/${token}`

                // Implement Nodemailer
                let info = await transporter.sendMail({
                    from: process.env.MAIL_ID,
                    to: user.email,
                    subject: "Reset Password Link || Sharma Kamal",
                    html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee"><a href=""
                                style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Sharma Kamal</a></div>
                        <p style="font-size:1.1em">Hi ${user.name},</p>
                        <p>Thank you for choosing my services. Use the following Link to reset your password. Reset Link is valid for 15
                            minutes</p>
                        <h2
                            style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;cursor:pointer">
                            <a style="color:white;text-decoration:none" target="_blank" href=${link}>Reset Your Password</a></h2>
                        <p style="font-size:0.9em;">Regards,<br />Sharma Kamal</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>Sharma Kamal</p>
                            <p>Surat</p>
                        </div>
                    </div>
                </div>`,
                })

                // Nodemailer Ends

                res.status(200).json({
                    status: true,
                    message: "Reset link sent to your registered email id."
                })
            }
            else {
                res.status(404).json({
                    status: false,
                    message: "User not found."
                })
            }
        }
    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

const changeResetPassword = async (req, res) => {
    const { password, cpassword } = req.body;
    const { id, token } = req.params;
    try {
        if (jwt.verify(token, process.env.JWT_RESET_KEY)) {
            const { _id } = jwt.verify(token, process.env.JWT_RESET_KEY)
            if (!password || !cpassword) {
                res.status(400).json({
                    status: false,
                    message: "All fields are required."
                })
            }
            else {
                if (password === cpassword) {
                    const salt = await bcrypt.genSalt(10)
                    const hpassword = await bcrypt.hash(password, salt)

                    // Pending from here
                    const passUpdate = await userModel.findByIdAndUpdate(_id, { password: hpassword })

                    if (passUpdate) {
                        res.status(200).json({
                            status: true,
                            message: "Password updated Successfully."
                        })
                    }
                    else {
                        res.status(409).json({
                            status: false,
                            message: "Password didn't update. Please try again!."
                        })
                    }
                }
                else {
                    res.status(409).json({
                        status: false,
                        message: "Password and Confirm password should match."
                    })
                }
            }
        }
        else {
            res.status(401).json({
                status: false,
                message: "Invalid Link or Link Expired."
            })
        }
    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

module.exports = {
    register,
    login,
    changePassword,
    getUserDetail,
    resetPassword,
    changeResetPassword,
    verifyEmail
}