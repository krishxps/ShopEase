const fs = require("fs");
const path = require("path");
const { features, title } = require("process");

let items = [];
let categories = [];

const initialize = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, "data", "items.json"),
      "utf8",
      (err, data) => {
        if (err) {
          reject("unable to read items file");
          return;
        }
        try {
          items = JSON.parse(data);
        } catch (err) {
          reject("unable to parse items file");
        }
      }
    );
    fs.readFile(
      path.join(__dirname, "data", "categories.json"),
      "utf8",
      (err, data) => {
        if (err) {
          reject("unable to read categories file");
          return;
        }
        try {
          categories = JSON.parse(data);
          resolve();
        } catch (err) {
          reject("unable to parse categories file");
        }
      }
    );
  });
};

const getAllItems = () => {
  return new Promise((resolve, reject) => {
    if (items.length > 0) {
      resolve(items);
    } else {
      reject("no results returned");
    }
  });
};

const getPublishedItems = () => {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published);
    if (publishedItems.length > 0) {
      resolve(publishedItems);
    } else {
      reject("no results returned");
    }
  });
};

const getCategories = () => {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject("no results returned");
    }
  });
};

const addItem = (item) => {
  return new Promise((resolve, reject) => {
    if (item.published === undefined) {
      item.published = false;
    } else {
      item.published = true;
    }
    const newItem = {
      id: items.length + 1,
      categories: item.categories,
      postDate: new Date().toISOString().split("T")[0],
      featuresImage: item.featureImage,
      price: parseFloat(item.price).toFixed(2) || item.price,
      title: item.title,
      body: item.body,
      published: item.published,
    };
    items.push(newItem);
    resolve(newItem);
  });
};

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
};
