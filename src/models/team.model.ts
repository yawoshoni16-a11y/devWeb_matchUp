import { BasicModel, BasicModelDBO, BasicModelDTO } from "./basic.model";
import { User, UserShortDTO } from "./user.model";

/**
 * Variable constants (enum) of type : string - for the team sport types
 */
export enum ESportType {
    FOOTBALL = 'football',
    TENNIS = 'tennis',
    VOLLEYBALL = 'volleyball',
    HANDBALL = 'handball'

};

/**
 * The model of a Team
 */
export interface Team extends BasicModel {
    name : string;
    description	?: string;
    sportType : ESportType;
    players : number[];
    trainerId : number
};

/**
 * The model of a TeamFull
 */
export interface TeamFull extends BasicModel {
    name : string;
    description	?: string;
    sportType : ESportType;
    players : User[];
    trainer : User
};

/**
 * Standard team representation with raw player IDs and trainerId. Returned by GET /teams/:id, 
 * POST /teams,PUT /teams/:id, PATCH /teams/:id/join, PATCH /teams/:id/leave
 */
export interface TeamDTO extends BasicModelDTO {
    name : string;
    description	?: string;
    sportType : ESportType;
    players : number[];
    trainerId : number
};

/**
 * Database object — shape stored in data/teams.json (snake_case). 
 * Used internally; never returned directly by the API
 */
export interface TeamDBO extends BasicModelDBO {
    name : string;
    description	?: string;
    sport_type : ESportType;
    players : number[];
    trainer_id : number
};

/**
 * Minimal team representation returned by GET /teams
 */
export interface TeamShortDTO {
    id : number;
    name : string;
    sportType : ESportType
};

/**
 * Full team representation with resolved player and trainer objects. 
 * Returned only by GET /teams/own
 */
export interface TeamFullDTO extends BasicModelDTO {
    name : string;
    description ?: string;
    sportType : ESportType;
    players : UserShortDTO[];
    trainer : UserShortDTO;
};

/**
 *  The model of a new Team
 */ 
export interface NewTeam {
    name : string;
    description ?: string;
    sportType : ESportType
};

/**
 *  Payload for creating a team (POST /teams)
 */ 
export interface NewTeamDTO {
    name : string;
    description ?: string;
    sportType : ESportType
};
