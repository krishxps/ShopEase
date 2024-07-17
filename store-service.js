// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const Sequelize = require('sequelize');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
let sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', '6KEOFPwGNS2d', {
    host: 'ep-small-lab-a5ijyo19.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

let items = [];
let categories = [];

//---------------------------------------------------------------------------
// Define Models
//---------------------------------------------------------------------------
const Category = sequelize.define("categories", {
    category: Sequelize.STRING
});

const Item = sequelize.define("item", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.STRING,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.FLOAT,
    categoryId: {
        type: Sequelize.INTEGER,
        references: {
            model: Category,
            key: 'id'
        }
    }
});

Item.belongsTo(Category, { foreignKey: 'categoryId' });

//---------------------------------------------------------------------------
/// initialize
//---------------------------------------------------------------------------
const initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to sync the database. " + err);
            });
    });
};
//---------------------------------------------------------------------------
/// Category Functions
//---------------------------------------------------------------------------
const getCategories = () => {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => resolve(data))
            .catch((err) => reject("no results returned" + err));
    });
};

const addCategory = (categoryData) => {
    return new Promise((resolve, reject) => {
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }
        Category.create(categoryData)
            .then(() => resolve())
            .catch((err) => reject("unable to create category"));
    });
};

const deleteCategoryById = (id) => {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        })
            .then((deleted) => {
                if (deleted) resolve();
                else reject("Category not found");
            })
            .catch((err) => reject("unable to delete category"));
    });
};

const getPublishedItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                category: category,
                published: true
            }
        })
        .then((data) => resolve(data))
        .catch((err) => reject("no results returned", err));
    });
};

//---------------------------------------------------------------------------
/// Item Functions
//---------------------------------------------------------------------------
const getAllItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll()
            .then((data) => resolve(data))
            .catch((err) => reject("no results returned", err));
    });
};

const getPublishedItems = () => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                published: true
            }
        })
        .then((data) => resolve(data))
        .catch((err) => reject("no results returned", err));
    });
};

const addItem = (itemData) => {
    itemData.published = !!itemData.published; 
    itemData.postDate = new Date().toISOString(); 
    return new Promise((resolve, reject) => {
        Item.create(itemData)
            .then(() => resolve())
            .catch((err) => reject("Unable to create item: " + err));
    });
};


const getItemsByMinDate = (minDateStr) => {
    const { gte } = Sequelize.Op;
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then((data) => resolve(data))
        .catch((err) => reject("no results returned", err));
    });
};

const getItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                id: id
            }
        })
        .then((data) => resolve(data[0]))
        .catch((err) => reject("no results returned", err));
    });
};
const getItemsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                category: category
            }
        })
        .then((data) => resolve(data))
        .catch((err) => reject("no results returned", err));
    });
};

const deleteItemById = (id) => {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
            .then((deleted) => {
                if (deleted) resolve();
                else reject("Item not found");
            })
            .catch((err) => reject("unable to delete item"));
    });
};

const deletePostById = (id) => {
    return new Promise((resolve, reject) => {
      Post.destroy({ where: { id } })
        .then((rowsDeleted) => {
          if (rowsDeleted === 1) {
            resolve();
          } else {
            reject("Post not found");
          }
        })
        .catch((err) => reject(err));
    });
  };
  
module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    addCategory,
    deleteCategoryById,
    getPublishedItemsByCategory,
    addItem,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    deleteItemById,
    deletePostById
};