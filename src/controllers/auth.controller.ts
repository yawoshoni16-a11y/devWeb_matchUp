import { response, Router } from "express";
import { Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { isString } from "../utils/guards";
import { AuthServices } from "../services/auth.service";
import { UsersServices } from "../services/user.service";
import { AuthenticatedUser, ERole } from "../models/user.model";

export const authController = Router();

authController.post('/login', (req: Request, res: Response) => {
    LoggerService.info('[POST] /auth/login');

    const username = req.body.username;
    const password = req.body.password;

    // Verify the type of the given information
    if (!isString(username) || !isString(password)) {
        return res.status(400).send('Bad type of request');
    };

    // Attempt to authenticate user with provided credentials(identifiants)
    const authUser = AuthServices.login(username, password);
    if (!authUser) {
        LoggerService.error('Authentication failed');
        return res.status(401).send('Authentication failed');
    };

    // Retrieve(récupère) user from database by username
    const user = UsersServices.getByUsername(username);
    if (!user) {
        LoggerService.error('User not found');
        return res.status(404).send ('User not found');
    };

    // Build authentication response with username and generated token
    const response : AuthenticatedUser = {
        username: user.username,
        token: authUser.token,
        role: ERole.PLAYER
    };

    return res.status(200).json(response);
})