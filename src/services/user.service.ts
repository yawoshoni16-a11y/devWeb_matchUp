import { FilesService } from "./files.service";
import { User, UserDTO, UserDBO, UserShortDTO, ERole} from "../models/user.model";
import { LoggerService } from "./logger.service";
import { UserMapper } from "../mappers/user.mapper";
import { isNumber, isString } from "../utils/guards";

/**
 * Exporting class of UsersServices
 */
export class UsersServices {
    private static fileName = 'data/users.json';

    /**
     * Function that allows an Admin to get all the informations about a user
     * UserDTO[]
     */
    public static getAllAdmin() : User[] {
        let data : UserDBO[] = [];

        try {
            data = FilesService.readFile<UserDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return [];
        }

        const results : User[] = [];
        for (let i = 0; i < data.length; i++) {
            results.push(UserMapper.fromDBO(data[i]));
        }
        return results;
    };

    /**
     * Function that allows an Other user to get a short version of the user
     * UserShortDTO[]
     */
    public static getAllOther() : User[] {
        let data : UserDBO[] = [];

        try {
            data = FilesService.readFile<UserDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return [];
        }

        const results : User[] = [];
        for (let i = 0; i < data.length; i++) {
            results.push(UserMapper.fromDBO(data[i]));
        }
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
    }

    /**
     * Function that creates a new User without requiring authentication.
     */
    public static create(user : User) : User | undefined {
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

        // Gives a new ID to the new User (+1 because he or she is new)
        user.id = maxId + 1;

        // Convert to DBO
        const newUserDBO = UserMapper.toDBO(user);
        userDBO.push(newUserDBO);

        // Write in the file
        try {
            FilesService.writeFile<UserDBO>('data/users.json', userDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        }
        return user;
    }

    /**
     * Function that update a User without requiring authentication.
     */
}