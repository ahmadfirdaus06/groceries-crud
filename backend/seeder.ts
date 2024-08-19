import { faker } from "@faker-js/faker";
import { Grocery, sequelize } from "./database";
import { logger } from "./helpers";

(async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        logger.error('Unable to connect to the database:', error)
        process.exit(1)
    }

    const groceries: { brand: string, product_name: string, barcode: number }[] = []

    for (let index = 0; index < 20; index++) {
        groceries.push({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })
    }

    try {
        await Grocery.bulkCreate(groceries)
    } catch (error) {
        console.log(error)
        logger.error(error)
        process.exit(1)
    }

    await sequelize.close()
})()

