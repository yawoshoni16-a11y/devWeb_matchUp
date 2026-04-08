import { AuthentificatedUser } from "../models/user.model";
import { generateFakeToken } from "../utils/token.utils";
import { UsersServices } from "./user.service";


export class AuthServices {
    public static login (username : string, password : string) : AuthentificatedUser | undefined {
        
        // Verify that the user exist
        const userFound = UsersServices.getByUsername(username);
        if (!userFound) return undefined;
        
        // Verify that the informations about a user are correct
        if (!UsersServices.validateUser(password, userFound.password)) return undefined;

        // Generates a token and verifies that the token is there
        const token = generateFakeToken(username);
        if (!token) return undefined;

        // Return the data of a AuthentificatedUser
        const results: AuthentificatedUser = {
            username: username,
            token: token
        };
        return results;
    }
}