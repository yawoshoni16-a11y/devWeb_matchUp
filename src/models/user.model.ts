import { BasicModelDBO, BasicModelDTO, BasicModel } from "./basic.model";

/**
 * Variable that allows us to use a authentification on the information 
 * where we need that
 */
export interface AuthentificatedUser {
    username : string;
    token : string
}
/**
 * Variable constants (enum) of type : string - for the user role
 */
export enum ERole {
    ADMIN = 'admin',
    PLAYER = 'player',
    REFEREE = 'referee',
    TRAINER = 'trainer'
};

/**
 * Variable constants (enum) of type : string - for the user status
 */
export enum EUserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
};

/**
 * 
 */
export interface User extends BasicModel {
    firstName : string;
    lastName : string;
    email : string;
    username : string;
    password : string;
    role : ERole;
    status : EUserStatus;
}

/**
 * Outbound user representation — never contains a password in responses.
 */
export interface UserDTO extends BasicModelDTO {
    firstName : string;
    lastName : string;
    email : string;
    username : string;
    password : string;
    role : ERole;
    status : EUserStatus;
};

/**
 * Full user profile with timestamps. Not currently used by any endpoint in the reverted code,
 * but kept for documentation purposes
 */
export interface UserFullDTO extends BasicModelDTO {
    firstName : string;
    lastName : string;
    email : string;
    username : string;
    role : ERole;
    status : EUserStatus;
};

/**
 * Minimal user representation. 
 * Returned by GET /users and GET /users/:id for non-admin callers
 */
export interface UserShortDTO {
    id : number;
    firstName : string;
    lastName : string;
};

/**
 * Payload for creating a user (POST /users). Role is always forced to player
 */
export interface NewUserDTO {
    firstName : string;
    lastName : string;
    email : string;
    username : string;
    password : string;
};

/**
 * Payload for creating a user (POST /users). Role is always forced to player
 */
export interface NewUser {
    firstName : string;
    lastName : string;
    email : string;
    username : string;
    password : string;
}

/**
 * Credentials (indentifiants) used to authenticate a user
 */
export interface UserLoginDTO {
    username : string;
    password : string;
};

/**
 * Database object — shape stored in data/users.json (snake_case). 
 * Used internally; never returned directly by the API
 */
export interface UserDBO extends BasicModelDBO{
    email : string;
    first_name : string;
    last_name : string;
    username : string;
    password : string;
    role : ERole;
    status : EUserStatus;
};