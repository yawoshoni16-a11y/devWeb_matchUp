import { FieldMapper } from "../mappers/field.mapper";
import { Field, FieldDBO, NewField } from "../models/field.model";
import { isNumber } from "../utils/guards";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

export class FieldsServices {
    private static fileName = 'data/fields.json';

    /**
     * Retrieves all fields.
     * @returns a list of all fields
     */
    public static getAll(): Field[] {
        let fieldDBO : FieldDBO[] = [];
        try {
            fieldDBO = FilesService.readFile<FieldDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading field file: ${error}`);
            return[];
        };

        const results : Field[] = [];
        for (let i = 0; i < fieldDBO.length; i++) {
            results.push(FieldMapper.fromFieldDBO(fieldDBO[i]));  
        };

        return results;
    };

    /**
     * Retrieves a specific field by its ID
     * @param id - The ID of the field to find
     * @returns A field instance if found, otherwise undefined if the field does not exist
     */
    public static getFieldByID(id : number): Field | undefined {
        let fieldsDBO: FieldDBO[] = [];
        try {
            fieldsDBO = FilesService.readFile<FieldDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading fields file: ${error}`);
            return undefined;
        };

        for (let i = 0; i < fieldsDBO.length; i++) {
            if (isNumber(id) && fieldsDBO[i].id === id) {
                // Convert the database object (DBO) to Domain Model (Game)
                return FieldMapper.fromFieldDBO(fieldsDBO[i]);
            };
        };
        return undefined;
    };

    /**
     * Create a new Field
     * @param newField - The creation of the new field
     * @returns A new field if it is possible, otherwise undefined if creation impossible
     */
    public static create(newField: NewField): Field | undefined {
        let fieldsDBO : FieldDBO[] = [];
        try {
            fieldsDBO = FilesService.readFile<FieldDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading fields file: ${error}`);
            return undefined;
        };

        /**
         * Search the last/max ID and update it
         */
        let maxId = 0;
        for (let i = 0; i < fieldsDBO.length; i++) {
            if (fieldsDBO[i].id > maxId) {
                maxId = fieldsDBO[i].id;
            };
        };

        /**
         * Creation of the new field by retrieve the info
         */
        const newFields : Field = {
            id: maxId + 1,
            name: newField.name,
            location: newField.location,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const newFieldDBO: FieldDBO = FieldMapper.toFieldDBO(newFields);
        fieldsDBO.push(newFieldDBO);

        try {
            FilesService.writeFile<FieldDBO>(this.fileName, fieldsDBO);
        } catch (error) {
            LoggerService.error(`Error writing fields file: ${error}`);
            return undefined;
        };
        
        return newFields;
    };

    /**
     * Update a field 
     * @param updatedField - The field to update
     * @returns A updated field if it is possible, otherwise undefined if not possible
     */
    public static update(updatedField: Field): Field | undefined {
        let fieldsDBO: FieldDBO[] = [];
        try {
            fieldsDBO = FilesService.readFile<FieldDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading fields file: ${error}`);
            return undefined;
        };

        // Find the field to update it
        let fieldIndex = -1;
        for (let i = 0; i < fieldsDBO.length; i++) {
            if (fieldsDBO[i].id === updatedField.id) {
                fieldIndex = i;
            };
        };

        // Undefined when the field is not found
        if (fieldIndex === -1) {
            LoggerService.error('Field not found');
            return undefined;
        };

        // Change the field in the table --> fieldsDBO[]
        fieldsDBO[fieldIndex] = FieldMapper.toFieldDBO(updatedField);

        // Save in the file
        try {
            FilesService.writeFile<FieldDBO>(this.fileName, fieldsDBO)
        } catch (error) {
            LoggerService.error('Error while writing in the file');
            return undefined;
        };

        // Everything is fine
        return updatedField;
    };
}