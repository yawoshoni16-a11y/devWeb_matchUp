import { Field, FieldDBO, FieldDTO, NewField, NewFieldDTO } from "../models/field.model";

export class FieldMapper {
    public static toFieldDTO(field : Field): FieldDTO {
        return {
            id: field.id,
            name: field.name,
            location: field.location,
            createdAt: field.createdAt.toISOString(),
            updatedAt: field.updatedAt.toISOString()
        };
    };

    public static toFieldDBO(field : Field): FieldDBO {
        return {
            id: field.id,
            name: field.name,
            location: field.location,
            created_at: field.createdAt.toISOString(),
            updated_at: field.updatedAt.toISOString()
        };
    };

    public static fromFieldDTO(dto: FieldDTO): Field {
        return {
            id: dto.id,
            name: dto.name,
            location: dto.location,
            createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date()
        };
    };

    public static fromFieldDBO(dbo: FieldDBO): Field {
        return {
            id: dbo.id,
            name: dbo.name,
            location: dbo.location,
            createdAt: dbo.created_at ? new Date(dbo.created_at) : new Date(),
            updatedAt: dbo.updated_at ? new Date(dbo.updated_at) : new Date()
        };
    };

    public static fromNewFieldDTO(newField: NewFieldDTO): NewField {
        return {
            name: newField.name,
            location: newField.location
        };
    };
}