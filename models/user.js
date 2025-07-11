// models/User.js
import { DataTypes } from "sequelize";
import { db } from "../config/database-multi.js";

export const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(100),
    },
    nip: {
      type: DataTypes.STRING(18),
    },

    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    active: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    kdkanwil: {
      type: DataTypes.CHAR(2),
      allowNull: true,
    },
    kdkppn: {
      type: DataTypes.CHAR(3),
      allowNull: true,
    },
    kdlokasi: {
      type: DataTypes.CHAR(2),
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
  }
);

export default {
  User,
};
