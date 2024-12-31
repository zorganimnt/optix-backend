'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        
    }
    Product.init({
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        isAvailable: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'product',
    });

    return Product;
};
