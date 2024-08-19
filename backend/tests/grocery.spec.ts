import request from "supertest"
import app from "../app"
import { faker } from "@faker-js/faker"
import { Grocery, sequelize } from "../database"

describe("test grocery endpoints", () => {
    beforeAll(async () => {
        await sequelize.authenticate()
        await sequelize.sync({ force: true })
    })

    afterEach(async () => {
        await sequelize.truncate({ force: true })
    })

    afterAll(async () => {
        await sequelize.drop()
        await sequelize.close()
    })

    it("create grocery successfully", async () => {
        const groceryData = {
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        }

        const res = await request(app).post("/groceries").send(groceryData);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toMatchObject(groceryData);
    })

    it("create grocery with missing data", async () => {
        const res = await request(app).post("/groceries").send({});

        expect(res.statusCode).toBe(422);
        expect(res.body.errors).toHaveProperty("brand")
        expect(res.body.errors).toHaveProperty("product_name")
        expect(res.body.errors).toHaveProperty("barcode")
    })

    it("create grocery with existing barcode", async () => {
        const barcode = parseInt(faker.finance.accountNumber())
        await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode
        })

        const res = await request(app).post("/groceries").send({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode
        });

        expect(res.statusCode).toBe(403);
    })

    it("get groceries limit of 20 results", async () => {
        const groceries: { brand: string, product_name: string, barcode: number }[] = []

        for (let index = 0; index < 50; index++) {
            groceries.push({
                brand: faker.company.name(),
                product_name: faker.commerce.productName(),
                barcode: parseInt(faker.finance.accountNumber())
            })
        }

        await Grocery.bulkCreate(groceries)

        const res = await request(app).get("/groceries").query({ brand: "a", product_name: "a", sort_by: "brand,asc" }).send({});

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(20)
    })

    const dataSets = [
        {
            message: "brand and product name",
            input: {
                brand: faker.company.name(),
                product_name: faker.commerce.productName(),
            }
        },
        {
            message: "brand, product name and sort by brand ASC",
            input: {
                brand: faker.company.name(),
                product_name: faker.commerce.productName(),
                sort_by: "brand,asc"
            }
        },
        {
            message: "brand, product name and sort by brand DESC",
            input: {
                brand: faker.company.name(),
                product_name: faker.commerce.productName(),
                sort_by: "brand,desc"
            }
        },
        {
            message: "brand, product name and sort by product name ASC",
            input: {
                brand: faker.company.name(),
                product_name: faker.commerce.productName(),
                sort_by: "product_name,asc"
            }
        },
        {
            message: "brand, product name and sort by product name DESC",
            input: {
                brand: faker.company.name(),
                product_name: faker.commerce.productName(),
                sort_by: "product_name,desc"
            }
        }
    ]

    it.each(dataSets)("get groceries with ($message) query parameters", async ({ message, input }) => {
        const res = await request(app).get("/groceries").query(input).send({});
        expect(res.statusCode).toBe(200);
    })

    it("get single grocery details", async () => {
        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const res = await request(app).get("/groceries/" + grocery.id).send({});

        expect(res.statusCode).toBe(200);
        const { updated_at: updatedAtResponse, created_at: crearedAtResponse, ...responseData } = res.body.data
        const { updated_at, created_at, ...modelData } = grocery.dataValues
        expect(responseData).toMatchObject(modelData);
    })

    it("get missing grocery details", async () => {
        const res = await request(app).get("/groceries/" + faker.number).send({});

        expect(res.statusCode).toBe(404);
    })

    it("update grocery details successfully", async () => {
        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const updatedData = {
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        }

        const res = await request(app).put("/groceries/" + grocery.id).send(updatedData);

        expect(res.statusCode).toBe(200);
        const { updated_at, created_at, ...responseData } = res.body.data
        expect(responseData).toMatchObject(updatedData);
    })

    it("update grocery details with missing inputs", async () => {
        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const res = await request(app).put("/groceries/" + grocery.id).send({});

        expect(res.statusCode).toBe(200);
        const { updated_at: updatedAtResponse, created_at: crearedAtResponse, ...responseData } = res.body.data
        const { updated_at, created_at, ...modelData } = grocery.dataValues
        expect(responseData).toMatchObject(modelData);
    })

    it("update grocery details with empty inputs", async () => {
        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const res = await request(app).put("/groceries/" + grocery.id).send({
            brand: "",
            product_name: "",
            barcode: 0
        });

        expect(res.statusCode).toBe(422);
        expect(res.body.errors).toHaveProperty("brand")
        expect(res.body.errors).toHaveProperty("product_name")
        expect(res.body.errors).toHaveProperty("barcode")
    })

    it("update grocery details with null inputs", async () => {
        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const res = await request(app).put("/groceries/" + grocery.id).send({
            brand: null,
            product_name: null,
            barcode: null
        });

        expect(res.statusCode).toBe(422);
        expect(res.body.errors).toHaveProperty("brand")
        expect(res.body.errors).toHaveProperty("product_name")
        expect(res.body.errors).toHaveProperty("barcode")
    })

    it("update grocery details with barcode of other existing grocery", async () => {
        const existing = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const updatedData = {
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: existing.barcode
        }

        const res = await request(app).put("/groceries/" + grocery.id).send(updatedData);

        expect(res.statusCode).toBe(403);
    })

    it("update grocery details with same barcode", async () => {
        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const updatedData = {
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: grocery.barcode
        }

        const res = await request(app).put("/groceries/" + grocery.id).send(updatedData);

        expect(res.statusCode).toBe(200);
        const { updated_at, created_at, ...responseData } = res.body.data
        expect(responseData).toMatchObject(updatedData);
    })

    it("delete grocery details successfully", async () => {
        const grocery = await Grocery.create({
            brand: faker.company.name(),
            product_name: faker.commerce.productName(),
            barcode: parseInt(faker.finance.accountNumber())
        })

        const res = await request(app).delete("/groceries/" + grocery.id).send({});

        expect(res.statusCode).toBe(200);
        expect(await Grocery.findByPk(grocery.id)).toBeNull()
    })

    it("delete missing grocery details", async () => {

        const res = await request(app).delete("/groceries/" + faker.number).send({});

        expect(res.statusCode).toBe(404);
    })
})