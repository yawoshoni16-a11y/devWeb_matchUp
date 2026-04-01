import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { ERole } from "../models/user.model";

export const userController = Router();

/**
 * This function returns all the users depending on the roles
 */
userController.get("/", (req: Request, res: Response) => {
    LoggerService.info('GET /users/');

    const role : ERole = req.body;
    const usersDBO = 
    
    if (role === ERole.ADMIN) {
            return {
                id : usersDBO.id,
                firstName : usersDBO.first_name,
                lastName : usersDBO.last_name,
                email : usersDBO.email,
                username : usersDBO.username,
                role : usersDBO.role,
                status : usersDBO.status
            };
            
         } 
         if (role === ERole.PLAYER) {
            return {
                id : usersDBO.id,
                firstName : usersDBO.first_name,
                lastName : usersDBO.last_name
            } 
            
        }
})