const mongoose = require("mongoose");

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
})

async function main()
{
    await mongoose.connect("mongodb://127.0.0.1:27017/airbnb");
}

const listingSchema = mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : String,
    image : {
        type : String,
        default : "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdlYnNpdGV8ZW58MHx8MHx8fDA%3D",
        set : (v)=> v==="" ? "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdlYnNpdGV8ZW58MHx8MHx8fDA%3D" 
        : v,    
    },
    price : Number,
    location : String,
    country : String, 
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing;