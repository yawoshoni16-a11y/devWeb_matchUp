import { BasicModelDTO } from "./basic.model";

// 
export enum ESportType {
    FOOTBALL = 'football',
    TENNIS = 'tennis',
    VOLLEYBALL = 'volleyball',
    HANDBALL = 'handball'

};

// The model of a Team
export interface TeamDTO extends BasicModelDTO {
    name : string,
    description	: string,
    sportType : ESportType,
    players : string,
    trainerId : number
};

// The model of a new Team
export interface NewTeamDTO {
    name : string,
    description ?: string,
    sportType : ESportType
};
