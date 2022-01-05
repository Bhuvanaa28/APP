const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    username: { type: String, unique: true },
    password_hash: String,
    email: { type: String, unique: true },
    email_verified: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
    })
);    

module.exports = User;