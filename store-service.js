const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

const initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                reject('unable to read items file');
                return;
            }
            try {
                items = JSON.parse(data);
            } catch (err) {
                reject('unable to parse items file');
            }
        });
        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
            if (err) {
                reject('unable to read categories file');
                return;
            }
            try {
                categories = JSON.parse(data);
                resolve();
            } catch (err) {
                reject('unable to parse categories file');
            }
        });
    });
};

const getAllItems = () => {
    return new Promise((resolve, reject) => {
        if (items.length > 0) {
            resolve(items);
        } else {
            reject('no results returned');
        }
    });
};

const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published);
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject('no results returned');
        }
    });
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        if (categories.length > 0) {
            resolve(categories);
        } else {
            reject('no results returned');
        }
    });
};

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};