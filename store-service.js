const fs = require("fs");
const path = require("path");

let items = [];
let categories = [];

//---------------------------------------------------------------------------
/// initialize
//---------------------------------------------------------------------------
const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(
            path.join(__dirname, "data", "items.json"),
            "utf8",
            (err, data) => {
                if (err) {
                    reject("Unable to read items file");
                    return;
                }
                try {
                    items = JSON.parse(data);
                    resolve();
                } catch (err) {
                    reject("Unable to parse items file");
                }
            }
        );

        fs.readFile(
            path.join(__dirname, "data", "categories.json"),
            "utf8",
            (err, data) => {
                if (err) {
                    reject("Unable to read categories file");
                    return;
                }
                try {
                    categories = JSON.parse(data);
                    resolve(); // Resolve once categories are loaded
                } catch (err) {
                    reject("Unable to parse categories file");
                }
            }
        );
    });
};

//---------------------------------------------------------------------------
/// Category Functions
//---------------------------------------------------------------------------
const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject("No categories found");
        }
    });
};

const getCategoryById = (categoryId) => {
    return new Promise((resolve, reject) => {
        const category = categories.find((cat) => cat.id === categoryId);
        if (category) {
            resolve(category);
        } else {
            reject("Category not found");
        }
    });
};

const getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        const itemsByCategory = items.filter(
            (item) => item.category === category && item.published
        );
        if (itemsByCategory.length > 0) {
            resolve(itemsByCategory);
        } else {
            reject("No published items found in this category");
        }
    });
};

//---------------------------------------------------------------------------
/// Item Functions
//---------------------------------------------------------------------------
const getAllItems = () => {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject("No items found");
        }
    });
};

const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter((item) => item.published);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("No published items found");
        }
    });
};

const addItem = (item) => {
    return new Promise((resolve, reject) => {
        // Example logic for adding an item; adjust as needed
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
        const itemsByCategory = items.filter((item) => item.category === category);
        if (itemsByCategory.length > 0) {
            resolve(itemsByCategory);
        } else {
            reject("No items found in this category");
        }
    });
};

const getItemsByMinDate = (minDateStr) => {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const itemsByDate = items.filter((item) => new Date(item.postDate) >= minDate);
        if (itemsByDate.length > 0) {
            resolve(itemsByDate);
        } else {
            reject("No items found with the specified minimum date");
        }
    });
};

const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        const item = items.find((item) => item.id == id);
        if (item) {
            resolve(item);
        } else {
            reject("Item not found");
        }
    });
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    getCategoryById,
    getPublishedItemsByCategory,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById
};
