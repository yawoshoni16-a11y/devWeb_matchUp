import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../models/auth.model";
import { AuthenticatedUser, ERole, User } from "../models/user.model";
import { generateFakeToken, validateFakeToken } from "../utils/token.utils";
import { UsersServices } from "./user.service";
import { LoggerService } from "./logger.service";
import { isString } from "../utils/guards";


export class AuthServices {
    /**
     * Authenticates a user with the provided credentials
     * @param username - The username of the user attempting to log in
     * @param password - The plain text password(mdp en clair) provided by the user
     * @returns An AuthenticatedUser object with username, token and role, or undefined if authentication fails
     */
    public static login (username : string, password : string) : AuthenticatedUser | undefined {
        
        // Verify that the user exist
        const userFound = UsersServices.getByUsername(username);
        if (!userFound) return undefined;
        
        // Verify that the informations about a user are correct
        if (!UsersServices.validateUser(password, userFound.password)) return undefined;

        // Generates a token and verifies that the token is there
        const token = generateFakeToken(username);
        if (!token) return undefined;

        // Return the data of a AuthenticatedUser
        const results: AuthenticatedUser = {
            username: username,
            token: token,
            role: ERole.PLAYER
        };
        return results;
    };

    /**
     * Function middleware that verifies the authenticity of a request by validating the Authorization token
     * @param req - The incoming HTTP request, extended with an optional authenticated user
     * @param res - The HTTP response object used to send error responses if authorization fails
     * @param next - The next middleware function to call if authorization succeeds
     * @returns void - Calls next() if authorized, otherwise returns a 401 response
     */
    public static authorize (req: AuthenticatedRequest, res: Response, next: NextFunction){
        // Extract the Authorization token from the request headers
        const token = req.get('Authorization');
        if (!token) {
            LoggerService.error('Missing authorization token');
            return res.sendStatus(401);
        };

        // Verify that the token is a valid string
        if (!isString(token)) {
            LoggerService.error('Invalid token format: expected a string');
            return res.sendStatus(401);
        };

        // Validate the token and extract the username
        const username = validateFakeToken(token);
        if (!username) {
            LoggerService.error('Invalid or expired token');
            return res.status(401).send('Unauthorized');
        };

        // Verify that the user associated with the token exists in the database
        const trueUser: User | undefined = UsersServices.getByUsername(username);
        if (!trueUser) {
            LoggerService.error('User associated with token not found');
            return res.sendStatus(401);
        };

        req.user = trueUser;
        return next();
    };

    /**
     * Function middleware that restricts access to admin and referee users only
     * @param req - The incoming HTTP request, extended with the authenticated user
     * @param res - The HTTP response object used to send error responses if authorization fails
     * @param next - The next middleware function to call if the user is an admin or a referee
     * @returns void - Calls next() if the user is admin or referee, otherwise returns 401 or 403 response
     */
    public static isAdminOrReferee (req: AuthenticatedRequest, res: Response, next: NextFunction){
        // Retrieve the authenticated user from the request
        const user = req.user;
        if (!user) {
            LoggerService.error('No authenticated user found in request');
            return res.status(401).send('Unauthorized');
        };

        // Verify that the user has the role : admin or referee
        if (user.role !== ERole.ADMIN && user.role !== ERole.REFEREE) {
            LoggerService.error(`Access denied: user '${user.username}' does not have admin or referee role`);
            return res.status(403).send('Forbidden');
        };
        return next();
    };

    /**
     * Middleware that restricts access to admin users only.
     * @param req - The incoming HTTP request, extended with the authenticated user
     * @param res - The HTTP response object used to send error responses if authorization fails
     * @param next - The next middleware function to call if the user is an admin
     * @returns void - Calls next() if the user is admin, otherwise returns 401 or 403 response
     */
    public static isAdmin (req: AuthenticatedRequest, res: Response, next: NextFunction){
        // Retrieve the authenticated user from the request
        const user = req.user;
        if (!user) {
            LoggerService.error('No authenticated user found in request');
            return res.status(401).send('Unauthorized');
        };

        // Verify that the user has the role : admin 
        if (user.role !== ERole.ADMIN) {
            LoggerService.error(`Access denied: user '${user.username}' does not have admin role`);
            return res.status(403).send('Forbidden');
        };
        return next();
    };

    /**
     * 
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    public static isTrainer (req: AuthenticatedRequest, res: Response, next: NextFunction){
        // Retrieve the authenticated user from the request
        const user = req.user;
        if (!user) {
            LoggerService.error('No authenticated user found in request');
            return res.status(401).send('Unauthorized');
        };

        // Verify that the user has the role : trainer
        if (user.role !== 'trainer') {
            LoggerService.error(`Access denied: user '${user.username}' does not have admin trainer`);
            return res.status(403).send('Forbidden');
        };
        return next();
    };
}