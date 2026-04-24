import { FieldMapper } from "../mappers/field.mapper";
import { Field, FieldDBO } from "../models/field.model";
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

    //public static create(name: string, location: string)
}