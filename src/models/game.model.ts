import { CANCELLED } from "node:dns";
import { BasicModel, BasicModelDBO, BasicModelDTO } from "./basic.model";

// The EGameStatus model
export enum EGameStatus {
    CREATED = 'created',
    SCHEDULED = 'scheduled',
    STARTED = 'started',
    FINISHED = 'finished',
    CANCELLED = 'cancelled'
};
// The Game model 
export interface Game extends BasicModel {
    status : EGameStatus;
    name ?: string;
    fieldId ?: number;
    refereeId ?: number;
    homeTeamId ?: number;
    awayTeamId ?: number;
    homeScore ?: number;
    awayScore ?: number;
    scheduledDate ?: string;
};

// The GameDTO model
export interface GameDTO extends BasicModelDTO {
    status : EGameStatus;
    name ?: string;
    fieldId ?: number;
    refereeId ?: number;
    homeTeamId ?: number;
    awayTeamId ?: number;
    homeScore ?: number;
    awayScore ?: number;
    scheduledDate ?: string;
};

// The short version model of GameDTO
export interface GameShortDTO {
    id : number;
    status ?: EGameStatus;
    name ?: string;
    fieldId ?: number;
    homeTeamId ?: number;
    awayTeamId ?: number;
    scheduledDate ?: string;
};

// The NewGame model
export interface NewGame {
    name ?: string;
    fieldId ?: number;
    refereeId ?: number;
    homeTeamId ?: number;
    awayTeamId ?: number;
    scheduledDate ?: string;
};

// The NewGameDTO model
export interface NewGameDTO {
    name ?: string;
    fieldId ?: number;
    refereeId ?: number;
    homeTeamId ?: number;
    awayTeamId ?: number;
    scheduledDate ?: string;
};

// The GamleDBO model
export interface GameDBO extends BasicModelDBO{
    status : EGameStatus;
    name ?: string;
    field_id ?: number;
    referee_id ?: number;
    home_team_id ?: number;
    away_team_id ?: number;
    home_score ?: number;
    away_score ?: number;
    scheduled_date ?: string;
};
