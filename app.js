// Import the "express" framework to build a web application.
import express from "express";

// Import the "body-parser" middleware to parse incoming request bodies.
import bodyParser from "body-parser";

import { config } from "dotenv";

// Import mongoose to interact with MongoDB, including destructuring the "mongo" object (though it's not used here).
import mongoose, { mongo } from "mongoose";

// Create an Express application instance.
const app = express();

// Define the port number on which the server will listen for requests.
const port = 3000;

config();

// Function to connect to MongoDB using mongoose asynchronously.
async function connectDB() {
  try {
    // Attempt to connect to MongoDB database located at "********".
    const conn = await mongoose.connect(process.env.MONGO_URI);
    // Log a success message with the host of the MongoDB connection.
    console.log("Connected to DB", conn.connection.host);
  } catch (err) {
    // If the connection fails, log the error.
    console.log(err);
  }
}

// Call the function to connect to the database.
connectDB();

// Define a schema for "Item", which serves as a blueprint for items in the database.
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, minLength: 3 }, // Define "name" as a required string with a minimum length of 3.
  },
  { timestamps: true } // Automatically add "createdAt" and "updatedAt" fields to each document.
);

// Create a model based on the schema, allowing interaction with the "items" collection in the database.
const Item = mongoose.model("Item", itemSchema);

// Middleware setup

// Serve static files (like CSS, JS, images) from the "public" directory.
app.use(express.static("public"));

// Use "body-parser" to parse URL-encoded form data in HTTP POST requests.
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to "ejs" for rendering dynamic HTML templates.
app.set("view engine", "ejs");

// Route definitions

// Define the root ("/") route with both GET and POST handlers.
app
  .route("/")
  // Handle GET requests to the root route.
  .get(async function (req, res) {
    let foundItems;
    try {
      // Query the "Item" model to retrieve all items from the database.
      foundItems = await Item.find({});
      // Render the "index" EJS template and pass dynamic data like title, heading, and items.
      res.render("index", {
        title: new Date().toLocaleDateString(), // Today's date as the title.
        heading: "To Do List", // Page heading.
        items: foundItems.length > 0 ? foundItems : "No Items Found", // Pass the found items or a default message if no items are found.
      });
    } catch (err) {
      // Log an error if something goes wrong during the database query.
      console.log("err : ", err);
    }
  })
  // Handle POST requests to the root route.
  .post(async function (req, res) {
    // Create a new item based on the data submitted in the request body (item name).
    const newitem = new Item({
      name: req.body.itemName, // The item name comes from the request body (form data).
    });

    try {
      // Save the new item to the database.
      await newitem.save();
      // Log the newly added item to the console.
      console.log("New Item Added", newitem);
      // Redirect the user back to the root route to refresh the page.
      res.redirect("/");
    } catch (err) {
      // Log any errors during the saving process.
      console.log(err);
      // Redirect the user back to the root route in case of an error.
      res.redirect("/");
    }
  });

// Define a route for deleting items by their ID.
app.route("/delete/:id").get(async function (req, res) {
  // Retrieve the "id" parameter from the request URL and store it in a variable.
  var id = req.params.id;

  // Log the ID of the item to be deleted.
  console.log("delete id=>", id);

  try {
    // Find the item by ID and delete it from the database.
    const deletedItem = await Item.findByIdAndDelete(id);
    // Log the deleted item for confirmation.
    console.log(deletedItem);
  } catch (err) {
    // Log any errors that occur during the deletion process.
    console.log("err", err);
    // Redirect the user back to the root route in case of an error.
    res.redirect("/");
  }

  // Redirect the user back to the root route after the deletion.
  res.redirect("/");
});

// Start the server and listen for incoming requests on the specified port.
app.listen(port, function () {
  // Log a message to indicate that the server has started and is listening on the specified port.
  console.log("Server started on port:", 3000);
});
