import { User, UserDBO, UserDTO, UserFullDTO, UserLoginDTO, UserShortDTO, NewUserDTO } from "../models/user.model";

/**
 * Mapper class to convert between User and UserDBO/UserDTO/UserShortDTO
 */
export class UserMapper {
    public static toUserDTO(user: User): UserDTO {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
            updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined
        };
    }

    public static toUserShortDTO(user: User): UserShortDTO {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
        };
    }

    public static fromDBO(dbo: UserDBO) : User {
        return {
            id : dbo.id,
            firstName : dbo.first_name,
            lastName : dbo.last_name,
            email : dbo.email,
            username : dbo.username,
            role : dbo.role,
            status : dbo.status,
            //createdAt : new Date (u.createdAt);
        }
    }

}