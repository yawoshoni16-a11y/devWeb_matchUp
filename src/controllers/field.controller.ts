import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { FieldsServices } from "../services/field.service";
import { FieldMapper } from "../mappers/field.mapper";
import { isNumber } from "../utils/guards";
import { Field, FieldDTO, NewFieldDTO } from "../models/field.model";
import { AuthServices } from "../services/auth.service";
import { AuthenticatedRequest } from "../models/auth.model";

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

/**
 * This route allows us to create a new field with the name and the location in the body
 */
fieldController.post('/', AuthServices.authorize, AuthServices.isAdmin, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[POST] /fields');

    const name = req.body.name;
    const location = req.body.location;

    if (!name || !location) {
        LoggerService.error('Name or location is missing or invalid');
        return res.status(400).json('Name or location is missing or invalid');
    };

    const newFieldDTO: NewFieldDTO = {
        name: name,
        location: location
    };
    

    const field: Field | undefined = FieldsServices.create(newFieldDTO);
    if (!field) {
        LoggerService.error('Error creating a field');
        return res.status(404).send('Error creating a field');
    };
    
    return res.status(201).json(FieldMapper.toFieldDTO(field));
});

/**
 * This route allows an admin to update a field
 */
fieldController.put('/:id', AuthServices.authorize, AuthServices.isAdmin, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PUT] /fields/:id');
    
    // Verify that the ID in the URL (path) is a number
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).send('ID must be a number');
    };

    // Verify that the path id is the same as the body
    const bodyId = Number(req.body.id);
    if (bodyId !== id) {
        LoggerService.error('BodyID and pathID is not the same');
        return res.status(400).send('BodyID and pathID is not the same');
    };

    // Verify the required fields
    const name = req.body.name;
    const location = req.body.location;
    if (!name || !location) {
        LoggerService.error('Invalid or missing name or location');
        return res.status(400).send('Invalid or missing name or location')
    };

    // Verify that the name is not already taken by another field
    const fieldName: Field | undefined = FieldsServices.getFieldByName(name);
    if (fieldName && fieldName.id !== id) {
        LoggerService.error('Name already taken');
        return res.status(404).send('Name already taken');
    };

    // Update the field
    const existingField: Field | undefined = FieldsServices.getFieldByID(id);
    if (!existingField) {
        LoggerService.error('Field not found');
        return res.status(404).send('Field not found');
    };

    const updateField : Field = {
        id : id,
        name : name,
        location : location,
        createdAt : existingField.createdAt,
        updatedAt : new Date()
    };

    const field: Field | undefined = FieldsServices.update(updateField);
    if (!field) {
        LoggerService.error('Fields not found');
        return res.status(404).send('Fields not found');
    };

    return res.status(200).json(FieldMapper.toFieldDTO(field));
});