import { BasicModelDTO } from "./basic.model";

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
 * Outbound user representation — never contains a password in responses.
 */
export interface UserDTO extends BasicModelDTO {
    firstName : string;
    lastName : string;
    email : string;
    username : string;
    password ?: string;
    role : ERole;
    status : EUserStatus;
}

/**
 * Payload for creating a user (POST /users). Role is always forced to player
 */
export interface NewUserDTO {
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
}