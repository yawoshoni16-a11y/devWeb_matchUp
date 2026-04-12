import { FilesService } from "./files.service";
import { User, UserDTO, UserDBO, UserShortDTO, ERole, NewUser, NewUserDTO, EUserStatus} from "../models/user.model";
import { LoggerService } from "./logger.service";
import { UserMapper } from "../mappers/user.mapper";
import { isNumber, isString } from "../utils/guards";
import bcrypt from "bcrypt";

/**
 * Exporting class of UsersServices
 */
export class UsersServices {
    protected static fileName = "data/users.json";

    /**
     * 
     */
    public static validateUser(pwd: string, hashedPwd : string) : boolean {
        const isPasswordValid = bcrypt.compareSync(pwd, hashedPwd);

        if (!isPasswordValid) {
            LoggerService.error('Invalid password');
            return false;
        } else {
            LoggerService.info('Valid password');
            return true;
        }
    };

    /**
     * Function that allows an Admin to get all the informations about a user
     * UserDTO[]
     */
    public static getAll() : User[] {
        let data : UserDBO[] = [];

        try {
            data = FilesService.readFile<UserDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return [];
        };

        const results : User[] = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].status === EUserStatus.ACTIVE) {
                results.push(UserMapper.fromDBO(data[i]));
        }
    };
        return results;
    };

    /**
     * Function that allows an Admin or a Referee to get a user info by his username
     */
    public static getByUsername(username : string) : User | undefined {
        let userDBO : UserDBO[] = [];
        try {
            userDBO = FilesService.readFile<UserDBO>(UsersServices.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`)
            return undefined;
        };

        for (let i = 0; i < userDBO.length; i++) {
           if (isString(username) && userDBO[i].username === username) {
                return UserMapper.fromDBO(userDBO[i]);
           } 
        };
        return undefined;
    };

    /**
     * Function that allows an Admin or a Referee to get a user info by his email
     */
    public static getByEmail(email : string) : User | undefined {
        let userDBO : UserDBO[] = [];
        try {
            userDBO = FilesService.readFile<UserDBO>(UsersServices.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`)
            return undefined;
        };

        for (let i = 0; i < userDBO.length; i++) {
           if (isString(email) && userDBO[i].email === email) {
                return UserMapper.fromDBO(userDBO[i]);
           } 
        };
        return undefined;
    };

    /**
     * Function that allows an Authenticated user to get a user info by his id
     */
    public static getById(id : number) : User | undefined {
        let userDBO : UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return undefined;
        };

        for (let i = 0; i < userDBO.length; i++) {
            if (isNumber(id) && userDBO[i].id === id) {
                return UserMapper.fromDBO(userDBO[i]);
            } 
        }
        return undefined;
    };

    /**
     * Function that creates a new User without requiring authentication.
     */
    public static create(user : NewUser) : User | undefined {
        let userDBO : UserDBO[] = [];
        try {
            userDBO = FilesService.readFile<UserDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return undefined;
        }

        // ID calculation
        let maxId = 0;
        for (let i = 0; i < userDBO.length; i++) {
            if (userDBO[i].id > maxId) {
                maxId = userDBO[i].id;
            }
        }

        // Gives a new ID to the new User (+1 because he or she or them is new)
        const newUser : User = {
            ...user,
            id :  maxId + 1,
            role: ERole.PLAYER,
            password: bcrypt.hashSync(user.password,10),
            status: EUserStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // Convert to DBO
        const newUserDBO = UserMapper.toDBO(newUser);
        userDBO.push(newUserDBO);

        // Write in the file
        try {
            FilesService.writeFile<UserDBO>('data/users.json', userDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        }
        return newUser;
    };

    /**
     * Function that update a User without requiring authentication.
     */
    public static update(id: number, updatedUser: User) : User | undefined {
        let userDBO : UserDBO [] = [];
        try {
            userDBO = FilesService.readFile<UserDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        // Find the user to update by his ID
        for (let i = 0; i < userDBO.length; i++) {
            if(userDBO[i].id === id) {

            // Only update allowed fields - preserve role, password and status
            userDBO[i].first_name = updatedUser.firstName;
            userDBO[i].last_name = updatedUser.lastName;
            userDBO[i].email = updatedUser.email;
            userDBO[i].username = updatedUser.username;
            userDBO[i].updated_at = new Date().toISOString();

            // Save the updated list back to the file
            try {
                FilesService.writeFile<UserDBO>(this.fileName, userDBO);
            } catch (error) {
                LoggerService.error(error);
                return undefined;
            };

            // Return the updated user
            return updatedUser;
            };
            
        };
        // User not found
        return undefined;
    };
}