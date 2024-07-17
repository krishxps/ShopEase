/*********************************************************************************
WEB322 – EB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Krish Sanjaybhai Patel
Student ID: 106198237
Date: 17 Jul 2024
Vercel Web App URL: https://web322-kspatel46.vercel.app/
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
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "hbs");

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
      formatDate: function(dateObj){
        let year = dateObj.getFullYear();
        let month = (dateObj.getMonth() + 1).toString();
        let day = dateObj.getDate().toString();
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }    
    },
  })
);

//---------------------------------------------------------------------------
/// Default Route
//---------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.redirect("shop");
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
      items = await storeService.getPublishedItemsByCategory(req.query.category);
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

app.get('/shop/:id', async (req, res) => {
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
    viewData.message = "No results for items";
  }

  try {
    viewData.item = await storeService.getItemById(req.params.id);
    if (!viewData.item || !viewData.item.published) {
      viewData.message = `No results for item with ID: ${req.params.id}`;
    }
  } catch (err) {
    viewData.message = "Error fetching item details";
  }

  try {
    let categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "No results for categories";
  }

  res.render("shop", { data: viewData });
});

//---------------------------------------------------------------------------
/// Item Routes
//---------------------------------------------------------------------------
app.get("/items", (req, res) => {
  if (req.query.category) {
    storeService
      .getItemsByCategory(req.query.category)
      .then((data) => {
        if (data.length > 0) res.render("items", { items: data });
        else res.render("items", { message: "no results" });
      })
      .catch((err) => {
        res.render("items", { message: "no results" });
      });
  } else if (req.query.minDate) {
    storeService
      .getItemsByMinDate(req.query.minDate)
      .then((data) => {
        if (data.length > 0) res.render("items", { items: data });
        else res.render("items", { message: "no results" });
      })
      .catch((err) => {
        res.render("items", { message: "no results" });
      });
  } else {
    storeService
      .getAllItems()
      .then((data) => {
        if (data.length > 0) res.render("items", { items: data });
        else res.render("items", { message: "no results" });
      })
      .catch((err) => {
        res.render("items", { message: "no results" });
      });
  }
});

app.get("/items/add", (req, res) => {
  storeService.getCategories()
      .then((data) => {
          res.render("addPost", { categories: data });
      })
      .catch((err) => {
          res.render("addPost", { categories: [] });
      });
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

app.get("/item/:id", (req, res) => {
  storeService
    .getItemById(req.params.id)
    .then((data) => {
      if (data) res.render("item", { item: data });
      else res.status(404).send("Item Not Found");
    })
    .catch((err) => {
      res.status(500).send("Unable to retrieve item");
    });
});

app.get("/items/delete/:id", (req, res) => {
  storeService
    .deletePostById(req.params.id)
    .then(() => res.redirect("/items"))
    .catch((err) => res.status(500).send("Unable to Remove Post / Post not found"));
});


//---------------------------------------------------------------------------
/// Category Routes
//---------------------------------------------------------------------------
app.get("/categories", (req, res) => {
  storeService.getCategories().then((data) => {
    if (data.length > 0) res.render("categories", { categories: data });
    else res.render("categories", { message: "no results" });
  }).catch((err) => {
    res.render("categories", { message: "no results" });
  });
});

app.get("/categories/add", (req, res) => {
  res.render("addCategory");
});

app.post("/categories/add", (req, res) => {
  storeService.addCategory(req.body)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send("Unable to add category");
    });
});

app.get("/categories/delete/:id", (req, res) => {
  storeService.deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch((err) => {
      res.status(500).send("Unable to remove category / Category not found");
    });
});

//---------------------------------------------------------------------------
/// 404 Error Handler
//---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).render("404");
});

//---------------------------------------------------------------------------
/// Start Server
//---------------------------------------------------------------------------
storeService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Express http server listening on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Unable to start server: ${err}`);
  });
