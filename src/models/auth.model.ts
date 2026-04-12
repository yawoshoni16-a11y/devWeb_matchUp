import { Request } from "express";
import { ERole, User } from "./user.model";

export interface AuthenticatedRequest extends Request {
    user ?: User;
};

export interface AuthenticatedUserDTO {
    role : ERole;
    username : string;
    token : string;
};