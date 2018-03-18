var mongoose = require("mongoose");

var messageSchema = mongoose.Schema({
    text: String,
    email: String,
    name: String,
    createdAt: {type: Date, default: Date.now},
    resolved: Boolean,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});




module.exports = mongoose.model("Message", messageSchema);