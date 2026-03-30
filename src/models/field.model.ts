import { BasicModelDTO } from "./basic.model";

export interface FieldDTO extends BasicModelDTO{
    name : string;
    location : string;
};

export interface NewFieldDTO {
    name : string;
    location : string;
};