import { FilesService } from "./files.service";
import { User, UserDTO, UserDBO, UserShortDTO, ERole} from "../models/user.model";
import { LoggerService } from "./logger.service";

/**
 * Exporting class of UsersServices
 */
export class UsersServices {
    private static fileName = 'data/users.json';

    /**
     * 
     */
    public static getAll() : User {
        let usersDBO : UserDBO[] = [];

        try {
            usersDBO = FilesService.readFile<UserDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return [];
        }

        const results : UserDTO[] | UserShortDTO[] = [];
    }
}