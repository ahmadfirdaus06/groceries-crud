import express, { NextFunction, Request, Response, Router } from "express"
import { Grocery } from "./database";
import Joi from "joi";
import { errorResponse, logger, paginate, paginateResponse, successResponse, validateInputs } from "./helpers";
import { Op } from "sequelize";
import cors from "cors"

const app = express()

const router = Router();

if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', '127.0.0.1')
    app.set("x-powered-by", false)
    app.set("env", process.env.NODE_ENV)
}
app.use(cors({ origin: "*" }))
// accepts only json request
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    if (!req.headers["content-type"] || req.headers["content-type"] !== "application/json") {
        return errorResponse(res, 400, "Missing Content-Type in header");
    }
    next()
})

router.get("/", async (req, res, next) => {
    const schema = Joi.object({
        product_name: Joi.string().required(),
        brand: Joi.string().required()
    })

    try {
        const { product_name, brand } = await validateInputs(schema, req.query, {
            allowUnknown: true
        })

        const orderByQuery = req.query.sort_by as string

        let orderBy: string[] = []

        if (orderByQuery) {
            orderBy = orderByQuery.split(",")

            if (orderBy.length === 2 && (orderBy[0] === "brand" || orderBy[0] === "product_name") && (orderBy[1].toUpperCase() === "ASC" || orderBy[1].toUpperCase() === "DESC")) {
            } else {
                return res.status(400).json({ message: "Invalid order by query: " + orderBy })
            }
        }
        const groceries = await Grocery.findAndCountAll({
            ...paginate(req.query), order: orderByQuery ? [[orderBy[0], orderBy[1].toUpperCase()]] : [["product_name", "ASC"]], where: {
                [Op.or]: [{ brand: { [Op.like]: `%${brand}%` } }, { product_name: { [Op.like]: `%${product_name}%` }, }],
            }
        })

        return paginateResponse(req, res, groceries)
    } catch (error) {
        next(error)
    }
})

router.post("/", async (req, res, next) => {
    const schema = Joi.object({
        barcode: Joi.number().required().greater(0),
        brand: Joi.string().required(),
        product_name: Joi.string().required()
    })

    try {
        const data = await validateInputs(schema, req.body)

        const groceryWithExistingBarcode = await Grocery.count({
            where: {
                barcode: data.barcode
            }
        });

        if (groceryWithExistingBarcode > 0) {
            return errorResponse(res, 403, "A grocery with the same barcode already exist.");
        }

        const grocery = await Grocery.create(data)

        return successResponse(res, grocery)
    } catch (error) {
        next(error)
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const grocery = await Grocery.findByPk(req.params.id)

        if (!grocery) {
            return errorResponse(res, 404, "Resource not found");
        }

        return successResponse(res, grocery)
    } catch (error) {
        next(error)
    }
})

router.put("/:id", async (req, res, next) => {
    const schema = Joi.object({
        barcode: Joi.number().optional().greater(0).disallow(null),
        brand: Joi.string().optional().disallow("", null),
        product_name: Joi.string().optional().disallow("", null)
    })

    try {
        const data = await validateInputs(schema, req.body)

        const grocery = await Grocery.findByPk(req.params.id)

        if (!grocery) {
            return res.status(404).json({ message: "Resource not found" })
        }

        if (data.barcode) {
            const groceryWithExistingBarcode = await Grocery.count({
                where: {
                    barcode: data.barcode,
                    id: {
                        [Op.not]: req.params.id
                    }
                }
            });

            if (groceryWithExistingBarcode > 0) {
                return res.status(403).json({ message: "A grocery with the same barcode already exist." })
            }
        }

        await grocery.update(data)
        await grocery.reload()

        return successResponse(res, grocery)
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const grocery = await Grocery.findByPk(req.params.id)

        if (!grocery) {
            return res.status(404).json({ message: "Resource not found" })
        }

        await grocery.destroy()

        return successResponse(res)
    } catch (error) {
        next(error)
    }
})

app.use("/groceries", router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Joi.ValidationError) {
        const errors = {} as any
        err.details.forEach(detail => errors[detail.path[0]] = detail.message + ".")
        return errorResponse(res, 422, "Given data was invalid", errors)
    }
    console.log(err)
    logger.error(err)
    return errorResponse(res, 500, "Internal Server Error")
})

app.use((req, res, next) => {
    return errorResponse(res, 404, "Resource not found")
});

export default app

