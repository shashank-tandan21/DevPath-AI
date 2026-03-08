const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './devpath_dev.db',
    logging: false
});

module.exports = sequelize;
