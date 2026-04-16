import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { ERole, NewUserDTO, User, UserDTO, NewUser, AuthenticatedUser, UserShortDTO } from "../models/user.model";
import { UsersServices } from "../services/user.service";
import { UserMapper } from "../mappers/user.mapper";
import { isNewUserDTO, isNumber, isString, isUserDTO } from "../utils/guards";
import { AuthServices } from "../services/auth.service";
import { AuthenticatedRequest } from "../models/auth.model";
import { ifError } from "node:assert";

export const userController = Router();

/**
 * This route returns all the users depending on the roles
 */
userController.get('/', AuthServices.authorize,(req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[GET] /users/');

    const user = req.user;
    if (!user) return res.status(401).send("not authorised");
    const role = user.role;
    
    const usersDTO = [];
    const users = UsersServices.getAll();
     
    /**
     * Condition regarding the role.
     * An Admin have all the informations about an user.
     * --> UserDTO[]
     */
    if (role === ERole.ADMIN) {
        for (let i = 0; i < users.length; i++) {
            usersDTO.push(UserMapper.toUserDTO(users[i]));
        };
    };
    
    /**
     * Condition regarding the role.
     * Others people receives short informations about an user.
     * --> UserShortDTO[]
     */
    if (role === ERole.PLAYER) {
        for (let i = 0; i < users.length; i++) {
            usersDTO.push(UserMapper.toUserShortDTO(users[i]));
        };
    };

    return res.status(200).json(usersDTO)
});

/**
 * This route returns the user that match with the username
 */
userController.get('/username/:username', AuthServices.authorize, AuthServices.isAdminOrReferee, (req: Request, res: Response) => {
    LoggerService.info('[GET] /users/username/:username');
    
    const username : string = req.params.username;

    /**
     * Verify the type of the username 
     */
    if (!isString(username)) {
        LoggerService.error('Username must be a string');
        return res.status(400).send('Username must be a string');
    };

    const user: User | undefined = UsersServices.getByUsername(username);

    if (user === undefined) {
        LoggerService.error('Username not found');
        return res.status(404).send('Username not found');
    }

    /**
     * Translate the model to a DTO
     */
    const userDTO: UserDTO = UserMapper.toUserDTO(user);
    return res.status(200).json(userDTO);
});

/**
 * This route returns the user that match with the email
 */
userController.get('/email/:email', AuthServices.authorize, AuthServices.isAdminOrReferee, (req: Request, res: Response) => {
    LoggerService.info('[GET] /users/email/:email');
    
    const email : string = req.params.email;

    /**
     * Verify the type of the username 
     */
    if (!isString(email)) {
        LoggerService.error('Email must be a string');
        return res.status(400).send('Email must be a string');
    };

    /**
     * Verify the size of the email
     */
    if (email.trim().length < 4) {
        LoggerService.error('The email must have minimum 4 caracters');
        return res.status(400).send('The email must have minimum 4 caracters');
    };

    /**
     * Verify if the email contains a caracter (@, .)
     */
    if (!email.includes('@') && !email.includes('.')) {
        LoggerService.error('Wrong email');
        return res.status(400).send('Wrong email');
    };

    const user: User | undefined = UsersServices.getByEmail(email);

    if (user === undefined) {
        LoggerService.error('Email not found');
        return res.status(404).send('Email not found');
    };

    /**
     * Translate the model to a DTO
     */
    const userDTO: UserDTO = UserMapper.toUserDTO(user);
    return res.status(200).json(userDTO);
});

/**
 * This route returns the user that match with the ID
 */
userController.get('/id/:id', (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[GET] /users/id/:id');
    
    const id = Number(req.params.id);

    /**
     * Verify the type of the ID 
     */
    if (!isNumber(id)) {
        LoggerService.error('Id must be a number');
        return res.status(400).send('Id must be a number');
    };

    const user: User | undefined = UsersServices.getById(id);
    if (user === undefined) {
        LoggerService.error('Id not found');
        return res.status(404).send('Id not found');
    };
    
    const connectedUser = req.user!;

    // Admin receives UserDTO, own profile receives UserDTO, other users receive UserShortDTO
    if (connectedUser.role === ERole.ADMIN || connectedUser.id === id) {
        const userDTO: UserDTO = UserMapper.toUserDTO(user);
        return res.status(200).json(userDTO);
    };

    const userShortDTO: UserShortDTO = UserMapper.toUserShortDTO(user);
    return res.status(200).json(userShortDTO);
});

/**
 * This route allows you to create a new user
 */
userController.post('/', (req: Request, res: Response) => {
    LoggerService.info('[POST] /users/');

    const UserDTO: NewUserDTO = req.body;

    // Verify if the user is valid
    if (!isNewUserDTO(UserDTO)) {
        LoggerService.error('Invalid User');
        return res.status(400).send('Invalid user');      
    };

    // Convert DTO -> User 
    const user: NewUser = UserMapper.fromNewDTO(UserDTO);

    /**
     * Verify the type of the username 
     */
    if (!isString(user.email)) {
        LoggerService.error('Email must be a string');
        return res.status(400).send('Email must be a string');
    };

    /**
     * Verify the size of the email
     */
    if (user.email.trim().length < 4) {
        LoggerService.error('The email must have minimum 4 caracters');
        return res.status(400).send('The email must have minimum 4 caracters');
    };

    /**
     * Verify if the email contains a caracter (@, .)
     */
    if (!user.email.includes('@') && !user.email.includes('.')) {
        LoggerService.error('Wrong email');
        return res.status(400).send('Wrong email');
    };

    /**
     * Verify if the username is already used 
     */
    if(UsersServices.getByUsername(user.username) !== undefined || UsersServices.getByEmail(user.email) !== undefined){
        LoggerService.error('Username or email already chosen');
        return res.status(400).send('Username or email already chosen');
    };

    // Call service to create an user
    const createdUser = UsersServices.create(user);

    if (!createdUser) {
        return res.status(400).send('Error creating user');
    };

    // Convert User -> DTO and send the response
    const responseDTO = UserMapper.toUserDTO(createdUser);

    return res.status(201).json(responseDTO);
});

/**
 * This route allows an admin to update any users and an user to update
 * his/her own profile
 */
userController.put('/:id', AuthServices.authorize, (req: Request, res: Response) => {
    LoggerService.info('PUT /users/:id');
    
    const id = Number(req.params.id);
    const updatedUser = req.body;
    const connectedUser = req.body;

    // Verify that the id is a valid number
    if (!isNumber(id)) {
        LoggerService.error('ID is not a valid number');
        return res.status(400).send('ID is not a valid number');
    };

    // Verify that the body ID matches the path ID
    if (updatedUser.id !== id) {
        LoggerService.error('Body ID and path ID do not match');
        return res.status(400).send('Invalid id');
    };

    // Non-admin user can only update their own profile
    if (connectedUser.role !== ERole.ADMIN && connectedUser.id !== id) {
        LoggerService.error(`Access denied: user '${connectedUser.username}' tried to update another user`);
        return res.status(403).send('Forbidden');
    };

    // Update the user
    const result = UsersServices.update(id, updatedUser);
    if (!result) {
        LoggerService.error('User not found');
        return res.status(404).send('User not found');
    };

    return res.status(200).json(result);
});

/**
 * This route allows an admin to soft-delete any users and an user to soft-delete
 * his/her own profile
 */
userController.delete('/:id', AuthServices.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[DELETE] /users/:id');

    const id = Number(req.params.id);
    // Retrieve the authenticated user
    const user = req.user;

    // Verify that the id is a number 
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('Invalid ID')
    };

    // Verify that the user to delete exist
    const userDeleted = UsersServices.getById(id);
    if (!userDeleted) {
        LoggerService.error('User not found');
        return res.status(404).json('User not found');
    };

    // Prevent an admin account from being deleted
    if (userDeleted.role === ERole.ADMIN) {
        LoggerService.error('Admin account can not be deleted');
        return res.status(400).json('Attempt to delete an admin account');
    };

    // Verify that the user can only soft-delete his own account
    if (user?.role !== ERole.ADMIN && user?.id !== id) {
        LoggerService.error('An user can not soft-delete an other user');
        return res.status(403).json('Authenticated user is not an admin');
    };

    // The soft delete with my service (usersServices.delete)
    const deleted = UsersServices.delete(id);
    return res.status(200).json(deleted)
})

/**
 * This route updates the role of a user (admin only)
 * The user must currently have the player role to be promoted
 * @returns 200 with the updated user, 400 if invalid ID, invalid role value or user is not a player
 * 401 if missing or invalid token, 403 if not admin, 404 if user not found
 */
userController.patch('/:id/role/:role', AuthServices.authorize, AuthServices.isAdmin, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /users/:id/role/:role');
    
    // Retrieve and verify the id
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number')
    };

    // Retrieve and verify the role
    const role = req.params.role;
    if (role !== ERole.PLAYER && role !== ERole.ADMIN && role !== ERole.TRAINER && role !== ERole.REFEREE) {
        LoggerService.error('Invalid role');
        return res.status(400).json('Invalid role');
    };
    
    const existingUser = UsersServices.getById(id);
    if (!existingUser) {
        LoggerService.error('User not found');
        return res.status(404).json('User not found');
    };

    if (existingUser.role !== ERole.PLAYER) {
        LoggerService.error('User is not a player');
        return res.status(400).json('User is not a player');
    };

    const updated = UsersServices.updateRole(role, id);
    if (!updated) {
        LoggerService.error('User not found');
        return res.status(404).json('User not found');
    };

    return res.status(200).json(UserMapper.toUserDTO(updated));
});

/**
 * This route reactivates an inactive user (admin only)
 * Sets the user's status back to active
 * @returns 200 (wwith no body), 401 if missing or invalid token, 403 if not admin, 404 if user not found
 */
userController.patch('/:id/reactivate', AuthServices.authorize, AuthServices.isAdmin, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /users/:id/reactivate');

    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number');
    };

    const update = UsersServices.reactivateUser(id);
    if (!update) {
        LoggerService.error('User not found');
        return res.status(404).json('User not found');
    };

    return res.status(200).send();
});