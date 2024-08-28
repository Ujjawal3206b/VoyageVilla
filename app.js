const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
// const ExpressError = require("./ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./Schema.js");
const { wrap } = require("module");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, '/public')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/airbnb");
}

// validate schema as middleware
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(ele => ele.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
}
app.listen(port, () => {
    console.log("connected with port", port);
});

app.get("/", (req, res) => {
    res.send("yahhhh..");
})
// all listings
app.get("/listings",wrapAsync(async (req, res) => {
    let result = await Listing.find({});
    res.render("listings/home.ejs", { result });
}));
// create new route
app.get("/listings/new", (req, res) => {
    res.render("listings/newform.ejs");
});
// click on each picture
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let showcontent = await Listing.findById(id);
    res.render("listings/showindividual.ejs", { l: showcontent });
}));
// response from new route
app.post(
    "/listings",
    validateListing,
    wrapAsync(async (req, res, next) => {
        // let {title,description,image,price,loaction,country} = req.body;
        const newlisting = new Listing(req.body.listing);
        await newlisting.save();
        res.redirect("/listings");
    })
);

// update
app.get(
    "/listings/:id/edit", 
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if(!list)
    {
        throw new ExpressError(400,"Not Found");
    }
    res.render("listings/edit.ejs", { list });
}));

// geting response from edit/update
app.put(
    "/listings/:id",
    validateListing,
    wrapAsync(async (req, res) => {
        let { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listings/${id}`);
    }));

// delete request
app.delete(
    "/listings/:id",
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedlist = await Listing.findByIdAndDelete(id);
    if (!deletedlist) {
        throw new ExpressError(404, "Listing not found");
    }
    console.log("deleted", deletedlist);
    res.redirect("/listings");
}));
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
})

app.use((err, req, res, next) => {
    let { status = 500, message = "oops something is wrong" } = err;
    // res.status(status).send(message);
    res.render("error.ejs", { message, status });
})