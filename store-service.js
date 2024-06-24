const fs = require("fs");
const path = require("path");

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
            category: item.category,
            postDate: new Date().toISOString().split("T")[0],
            featureImage: item.featureImage,
            price: parseFloat(item.price).toFixed(2) || item.price,
            title: item.title,
            body: item.body,
            published: item.published,
        };
        items.push(newItem);
        resolve(newItem);
    });
};

const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const itemsByCategory = items.filter((item) => item.category == category);
        if (itemsByCategory.length > 0) {
            resolve(itemsByCategory);
        } else {
            reject("no results returned");
        }
    });
};

const getItemsByMinDate = (date) => {
    return new Promise((resolve, reject) => {
        const itemsByDate = items.filter((item) => item.postDate >= date);
        if (itemsByDate.length > 0) {
            resolve(itemsByDate);
        } else {
            reject("no results returned");
        }
    });
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getItemsByMinDate
};
