/**
 * model for recording all changes to objects
 */
export interface BasicModel {
    id : number;
    createdAt : Date;
    updatedAt : Date;
    
};

/**
 * model for recording all changes to objects for our database
 */
export interface BasicModelDBO {
    id : number;
    created_at : string;
    updated_at : string;
    
};

/**
 * model for recording all changes to objects without the property delete 
 */
export interface BasicModelDTO {
    id : number;
    createdAt ?: string;
    updatedAt ?: string;
};

