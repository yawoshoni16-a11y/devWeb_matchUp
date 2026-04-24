import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { FieldsServices } from "../services/field.service";
import { FieldMapper } from "../mappers/field.mapper";
import { isNumber } from "../utils/guards";
import { Field, FieldDTO } from "../models/field.model";

export const fieldController = Router();

/**
 * This route allows to get a list of all fields (no auth needed)
 */
fieldController.get('/', (req: Request, res: Response) => {
    LoggerService.info('[GET] /fields');

    // Retrieve all fields from the service
    const fieldsDTO = [];
    const fields = FieldsServices.getAll()

    // Travels every fields returned by the server
    for (const field of fields) {
        fieldsDTO.push(FieldMapper.toFieldDTO(field));
    };

    // Return the list of field with code 200
    return res.status(200).json(fieldsDTO);
});

/**
 * This route allows to get a field (no auth needed)
 */
fieldController.get('/:id', (req: Request, res: Response) => {
    LoggerService.info('[GET] /fields/:id');

    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).send('ID must be a number');
    };

    const field: Field | undefined = FieldsServices.getFieldByID(id);
    if (field === undefined) {
        LoggerService.error('Game not found');
        return res.status(404).send('Game ID not found');
    };

    const fieldsDTO: FieldDTO = FieldMapper.toFieldDTO(field);
    return res.status(200).json(fieldsDTO);
});