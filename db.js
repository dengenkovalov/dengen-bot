const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'telega_base',
    'root',
    'password',
    {
        host: '109.71.12.107',
        port: '6432',
        dialect: 'postgres'
    }
)