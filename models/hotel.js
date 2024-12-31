'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Hotel extends Model {
        static associate(models) {
            this.hasMany(models.Admin, { foreignKey: 'hotelId' });
        }
    }
    Hotel.init({
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
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
        modelName: 'Hotel',
        tableName: 'hotel',
    });

    return Hotel;
};
