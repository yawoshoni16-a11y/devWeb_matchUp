import { Request } from "express";
import { User } from "./user.model";

export interface AuthenticatedRequest extends Request {
    user ?: User;
};

export interface LoginResponseDTO {
    role : string;
    username : string;
    token : string;
};