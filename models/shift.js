'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Shift extends Model {
      
        static associate(models) {
            // Example: Shift belongs to a Hotel via foreignKey 'staffId'
            this.belongsTo(models.Staff, { foreignKey: 'staffId' });

           
        }
    }

    Shift.init({ 
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        isOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        ordersDetails: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        totalOrderNumber: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalBookedBreakfast: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalAmountBreakfast: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalNbFreeBreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalAmountsExtras: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalCashable: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalSales: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalAllBf: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalNbCashable: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totlaNbExtraBreakfast: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalNbFreeExtraBreakfast: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        totalAmountExtraBf: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalAmountExtraRoom: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalAmountExtraCard: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalAmountExtraCash: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
        },
        totalAmountExtraFree: {
            type: DataTypes.FLOAT,
            defaultValue: 0.0,
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
        },
    }, {
        sequelize,
        modelName: 'Shift',
        tableName: 'shift', // Use the appropriate table name
    });

    return Shift;
};
