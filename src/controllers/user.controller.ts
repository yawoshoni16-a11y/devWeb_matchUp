import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { ERole, NewUserDTO, User, UserDTO, NewUser } from "../models/user.model";
import { UsersServices } from "../services/user.service";
import { UserMapper } from "../mappers/user.mapper";
import { isNewUserDTO, isNumber, isString, isUserDTO } from "../utils/guards";

export const userController = Router();

/**
 * This route returns all the users depending on the roles
 */
userController.get('/', (req: Request, res: Response) => {
    LoggerService.info('[GET] /users/');

    const role : ERole = req.body;
    const usersDTO = [];
    
    /**
     * Condition regarding the role.
     * An Admin have all the informations about an user.
     * --> UserDTO[]
     */
    if (role === ERole.ADMIN) {
        const users = UsersServices.getAllAdmin();

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
        const users = UsersServices.getAllOther();

        for (let i = 0; i < users.length; i++) {
            usersDTO.push(UserMapper.toUserShortDTO(users[i]));
        };
};

    return res.status(200).json(usersDTO)
});

/**
 * This route returns the user that match with the username
 */
userController.get('/username/:username', (req: Request, res: Response) => {
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
userController.get('/email/:email', (req: Request, res: Response) => {
    LoggerService.info('[GET] /users/email/:email');
    
    const email : string = req.params.email;

    /**
     * Verify the type of the username 
     */
    if (!isString(email)) {
        LoggerService.error('Email must be a string');
        return res.status(400).send('Email must be a string');
    };

    const user: User | undefined = UsersServices.getByEmail(email);

    if (user === undefined) {
        LoggerService.error('Email not found');
        return res.status(404).send('Email not found');
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
userController.get('/id/:id', (req: Request, res: Response) => {
    LoggerService.info('[GET] /users/id/:id');
    
    const id = Number(req.params.id);

    /**
     * Verify the type of the username 
     */
    if (!isNumber(id)) {
        LoggerService.error('Id must be a number');
        return res.status(400).send('Id must be a number');
    };

    const user: User | undefined = UsersServices.getById(id);

    if (user === undefined) {
        LoggerService.error('Id not found');
        return res.status(404).send('Id not found');
    }

    /**
     * Translate the model to a DTO
     */
    const userDTO: UserDTO = UserMapper.toUserDTO(user);
    return res.status(200).json(userDTO);
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

    // Convert DTO → User (métier)
    const user: User = UserMapper.fromNewDTO(UserDTO);

    // Call service
    const createdUser = UsersServices.create(user);

    if (!createdUser) {
        return res.status(500).send('Error creating user');
    }

    // Convert User → DTO de réponse
    const responseDTO = UserMapper.toUserDTO(createdUser);

    return res.status(201).json(responseDTO);
})