
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require("../models/user.model.js");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
       user: process.env.EMAIL_USERNAME,
       pass: process.env.EMAIL_PASSWORD,
    },
});

const signup = async (req, res) => {
    const { username, password_hash, email } = req.body;
    try {
        const existingUser = await User.findOne({ email }).exec();
        if (existingUser) {
            return res.status(409).send({message: "Email is already in use."});
        }
        else
        {
            const hash = await bcrypt.hash(password_hash, 8);
            const user = await new User({
            _id: new mongoose.Types.ObjectId,
            username: username,
            password_hash: hash,
            email: email
            }).save();        
            // Generate a verification token with the user's ID
            const verificationToken = function (user) {
                const Token = jwt.sign(
                    { ID: user._id },
                    process.env.USER_VERIFICATION_TOKEN_SECRET,
                    { expiresIn: "3600" }
                );    
                return Token;
            }(user); 
            //  Email the user verification link
            const BASE_URL = process.env.URL;
            const url = `${BASE_URL}/email_verify/${verificationToken}`
            var mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: 'Verify Account',
                html: `Click <a href = '${url}'>here</a> to verify your email.`
            }
            transporter.sendMail({mailOptions, function (err, info) {
                if(err)
                {
                    return res.status(500).send({ success: false, message: err.message })
                }
                else
                {
                    return res.status(201).send({
                        success: true,
                        message: `Successfully signed up, Verification email sent to ${email}`,
                        data: {id: user._id}
                    });   
                } 
            }})                 
        }
    } catch(err){
        return res.status(500).send({ success: false, message: err.message });
    }
};

const verify = async (req, res) => {
    const { token } = req.params    // Check we have an id
    if (!token) {
        return res.status(422).send({message: "Missing Token"});
    }    
    // Verify the token from the URL
    let payload = null
    try {
        payload = jwt.verify(
           token,
           process.env.USER_VERIFICATION_TOKEN_SECRET
        );
    } catch (err) {
        return res.status(500).send(err);
    }    
    try{
        // Find user with matching ID
        const user = await User.findOne({ _id: payload.ID }).exec();
        if (!user) {
           return res.status(404).send({message: "User does not exist"});
        }        
        // Update user verification status to true
        user.email_verified = true;
        await user.save();        
        return res.status(200).send({message: "Account Verified"});
     } catch (err) {
        return res.status(500).send(err);
     }
}

const login = async (req, res) => {
    const {_id: id, username, password, email } = req.body
    //const token = jwt.sign({ id, username, email }, process.env.JWT_SECRET);  
    try{
        // Verify a user with the email exists
        const user = await User.findOne({ email }).exec();
        if (!user) {
             return res.status(404).send({message: "User does not exist"});
        }       
        // Ensure the account has been verified
        if(!user.verified){
             return res.status(403).send({ 
                   message: "Account not verified!" 
             });
        }        
        else
        {
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) throw new Error('invalid password provided');
            return res.status(200).send({success: true, message: "User logged in successfully"});
        }
    } catch(err) {
        return res.status(500).send({success:false,'message':err});
     }
}

module.exports = {signup,verify,login};