import { Request, Response } from "express";
import Joi from "joi";
import winston from "winston";
import path from "path"

const paginate = (params: any) => {
    const schema = Joi.object({
        page: Joi.number().optional(),
        limit: Joi.number().optional()
    });

    const { error, value } = schema.validate(params, {
        abortEarly: false, errors: {
            wrap: {
                label: ''
            },
        },
        allowUnknown: true
    })

    if (error) {
        throw error
    }

    const { page = 1, limit = 20 } = value
    const currentPage = page > 0 ? page : 1
    const offset = (currentPage - 1) * limit;
    return {
        offset,
        limit,
    };
}

const paginateResponse = (req: Request, res: Response, results: { count: number, rows: any[] }) => {
    return successResponse(res, {
        page: req.query.page && parseInt(req.query.page as string) > 0 ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        data: results.rows,
        total: results.count
    }, true)
}

const logger = winston.createLogger({
    format: winston.format.simple(),
    transports: [new winston.transports.File({ filename: path.join(__dirname + '/app.log') })],
    silent: process.env.NODE_ENV === "test"
})

const validateInputs = async (schema: Joi.ObjectSchema<any>, inputs: any, validationOptions?: Joi.AsyncValidationOptions): Promise<any> => {
    try {
        const params = await schema.validateAsync(inputs, {
            errors: {
                wrap: {
                    label: ''
                },
            },
            abortEarly: false,
            ...validationOptions
        })

        return params
    } catch (error) {
        throw error
    }

}

const successResponse = (res: Response, data?: any, paginated?: boolean) => {
    return res.json(paginated ? data : { data })
}

const errorResponse = (res: Response, status: number, message: string, errors?: any) => {
    return res.status(status).json({
        message,
        errors
    })
}

export { paginate, paginateResponse, logger, validateInputs, successResponse, errorResponse }