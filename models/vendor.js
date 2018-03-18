var mongoose = require("mongoose");

var vendorSchema = new mongoose.Schema({
    name: String, 
    price: String,
    image: String,
    p: String,
    url: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default: Date.now},
    author: {
      id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      } ,
      username: String
    },
    reportedBy: [String],
    reportedCount: Number,
    reportedComment: Boolean,
    approved: Boolean,
    
    
   
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment",
          
        }
        ]
});
module.exports = mongoose.model("Vendor", vendorSchema);