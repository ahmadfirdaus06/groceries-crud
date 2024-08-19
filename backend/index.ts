import app from "./app";
import { sequelize } from "./database";
import { logger } from "./helpers";
import dotenv from "dotenv"

dotenv.config();

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Connection has been established successfully.');
        logger.info('Connection has been established successfully.')
        app.listen(3000, () => {
            console.log("App is listening on http://localhost:3000")
            logger.info('App is listening on http://localhost:3000')
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        logger.error('Unable to connect to the database:', error);
        process.exit(1)
    }
})()

