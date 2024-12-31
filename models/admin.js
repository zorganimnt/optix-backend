'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {

    static associate(models) {
      this.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    }
  }
  Admin.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Hotel',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    perms: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'Admin',
    tableName: 'admin', // Explicitly set the table name
  });

  return Admin;
};
