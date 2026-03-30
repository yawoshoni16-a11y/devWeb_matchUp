import { CANCELLED } from "node:dns";
import { BasicModelDTO } from "./basic.model";

// The EGameStatus model
export enum EGameStatus {
    CREATED = 'created',
    SCHEDULED = 'scheduled',
    STARTED = 'started',
    FINISHED = 'finished',
    CANCELLED = 'cancelled'
};

// The GameDTO model
export interface GameDTO extends BasicModelDTO {
    status : EGameStatus;
    fieldId : number;
    refereeId : number;
    homeTeamId : number;
    awayTeamId : number;
    homeScore : number;
    awayScore : number;
    scheduledDate : string;
};

// The short version model of GameDTO
export interface GameShortDTO {
    id : number;
    status : EGameStatus;
    name : string;
    fieldId : number;
    homeTeamId : number;
    awayTeamId : number;
    scheduledDate : string;
};

// The NewGameDTO model
export interface NewGameDTO {
    name : string;
    fieldId : number;
    refereeId : number;
    homeTeamId : number;
    awayTeamId : number;
    scheduledDate : string;
};
