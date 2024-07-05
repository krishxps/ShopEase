/*********************************************************************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Krish Sanjaybhai Patel
Student ID: 106198237
Date: 25 June 2024
Vercel Web App URL: https://web322-app-krishxps.vercel.app/
GitHub Repository URL: https://github.com/krishxps/web322-app

********************************************************************************/
//---------------------------------------------------------------------------
/// Library & File Imports
//---------------------------------------------------------------------------
const express = require("express");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");

const storeService = require("./store-service");

//---------------------------------------------------------------------------
/// Server Setup
//---------------------------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 8080;

//---------------------------------------------------------------------------
/// Cloudinary Setup
//---------------------------------------------------------------------------
cloudinary.config({
  cloud_name: "dh0zkzgpk",
  api_key: "645712828111368",
  api_secret: "FJuB75gHkggMxdNmaG8EPSehV5w",
});
const upload = multer();

//---------------------------------------------------------------------------
/// Custom Middleware
//---------------------------------------------------------------------------
app.set("view engine", "hbs");

app.use(express.static("public"));

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        safeHTML: function (html) {
            return new Handlebars.SafeString(html);
          },      
          lookupCategory: async function (categoryId) {
            try {
                const category = await storeService.getCategoryById(categoryId);
                return category ? category.name : "Unknown Category";
            } catch (err) {
                console.error("Error in lookupCategory helper:", err);
                return "Unknown Category";
            }
        },        
      navLink: function (url, options) {
        return (
          '<li class="nav-item"><a ' +
          (url == app.locals.activeRoute
            ? ' class="nav-link active"'
            : 'class="nav-link"') +
          ' href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);

//---------------------------------------------------------------------------
/// Default Route
//---------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.render("about");
});

//---------------------------------------------------------------------------
/// Shop Routes
//---------------------------------------------------------------------------
app.get("/shop", async (req, res) => {
  let viewData = {};

  try {
    let items = [];
    if (req.query.category) {
      items = await storeService.getPublishedItemsByCategory(
        req.query.category
      );
    } else {
      items = await storeService.getPublishedItems();
    }
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    let post = items[0];
    viewData.items = items;
    viewData.item = post;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }
  res.render("shop", { data: viewData });
});

app.get("/shop/:id", async (req, res) => {
  let viewData = {};

  try {
    let items = [];

    if (req.query.category) {
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      items = await storeService.getPublishedItems();
    }
    items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }
  try {
    viewData.item = await storeService.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});
//---------------------------------------------------------------------------
/// Item Routes
//---------------------------------------------------------------------------
app.get("/items", (req, res) => {
  if (req.query.category) {
    storeService
      .getItemsByCategory(req.query.category)
      .then((data) => res.render("items", { items: data }))
      .catch((err) =>
        res.status(500).render("posts", { message: "no results", error: err })
      );
  } else if (req.query.minDate) {
    storeService
      .getItemsByMinDate(req.query.minDate)
      .then((data) => res.render("items", { items: data }))
      .catch((err) =>
        res.status(500).render("posts", { message: "no results", error: err })
      );
  } else {
    storeService
      .getAllItems()
      .then((data) => res.render("items", { items: data }))
      .catch((err) =>
        res.status(500).render("posts", { message: "no results", error: err })
      );
  }
});

app.get("/items/add", (req, res) => {
  res.render("additem");
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService
      .addItem(req.body)
      .then(() => res.redirect("/items"))
      .catch((err) => res.status(500).json({ message: err }));
  }
});

app.get("/items/:id", (req, res) => {
  storeService
    .getItemById(req.params.id)
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ message: err }));
});

//---------------------------------------------------------------------------
/// Category Routes
//---------------------------------------------------------------------------
app.get("/categories", (req, res) => {
  storeService
    .getCategories()
<<<<<<< HEAD
    .then((data) => res.render("categories", { categories: data }))
    .catch((err) =>
      res.status(500).render("posts", { message: "no results", error: err })
    );
=======
    .then((data) => res.json(data))
    .catch((err) => res.status(500).json({ message: err }));
>>>>>>> parent of 36b4378 (Part 3 Done Fully)
});

//---------------------------------------------------------------------------
/// 404 Routes
//---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

//---------------------------------------------------------------------------
/// Start Server
//---------------------------------------------------------------------------
storeService
  .initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Express http server listening on port http://localhost:${PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(`Unable to start server: ${err}`);
  });

//---------------------------------------------------------------------------
/// Exports
//---------------------------------------------------------------------------
module.exports = app;
