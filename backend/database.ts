import { Sequelize, DataTypes, Model } from "sequelize";
import path from "path"
import { logger } from "./helpers";
import dotenv from "dotenv"

dotenv.config();

const sequelize = process.env.NODE_ENV === "test" ? new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname + "/grocery.sqlite"),
    logging: false
}) : new Sequelize(process.env.DB_NAME ?? "groceries", process.env.DB_USERNAME ?? "root", process.env.DB_PASSWORD ?? "r00t_p@55w0rd", {
    host: process.env.DB_HOST,
    port: 3306,
    dialect: "mysql",
    logging: (msg) => logger.info(msg)
});

class Grocery extends Model {
    declare id: number
    declare brand: string
    declare product_name: string
    declare barcode: number
}

Grocery.init(
    {
        brand: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        barcode: {
            type: DataTypes.BIGINT,
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: "groceries",
        updatedAt: "updated_at",
        createdAt: "created_at",
    },
);

export { sequelize, Grocery }