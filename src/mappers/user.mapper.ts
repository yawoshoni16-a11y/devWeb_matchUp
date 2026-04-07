import { User, UserDBO, UserDTO, UserFullDTO, UserLoginDTO, UserShortDTO, NewUserDTO, NewUser } from "../models/user.model";

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
    };

    public static toUserShortDTO(user: User): UserShortDTO {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
        };
    };

    public static fromNewDTO(dto: NewUserDTO) : NewUser {
        return {
            firstName : dto.firstName,
            lastName : dto.lastName,
            email : dto.email,
            username : dto.username,
            password : dto.password
        }
    }

    public static fromDBO(dbo: UserDBO) : User {
        return {
            id : dbo.id,
            firstName : dbo.first_name,
            lastName : dbo.last_name,
            email : dbo.email,
            username : dbo.username,
            password : dbo.password,
            role : dbo.role,
            status : dbo.status,
            createdAt: dbo.createdAt ? new Date(dbo.createdAt) : undefined,
            updatedAt: dbo.updatedAt ? new Date(dbo.updatedAt) : undefined,
            deletedAt: dbo.deletedAt ? new Date(dbo.deletedAt) : undefined
            
        }
    };

    public static toDBO(user : User) : UserDBO {
        return {
            id : user.id,
            first_name : user.firstName,
            last_name : user.lastName,
            email : user.email,
            username : user.username,
            role : user.role,
            status : user.status,  
            password : user.password,
            createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
            updated_at: user.updatedAt ? user.updatedAt.toISOString() : undefined,
            deleted_at: user.deletedAt ? user.deletedAt.toISOString() : undefined
        }
    };

    public static toTableDBO(users : User[]) : UserDBO[] {
        const tableDBO: UserDBO[] = [];
        for (const user of users) {
            let userDBO : UserDBO = UserMapper.toDBO(user);
            tableDBO.push(userDBO);
        }
        return tableDBO;
    };
}