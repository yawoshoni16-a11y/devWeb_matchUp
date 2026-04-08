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
            password: user.password,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
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
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at)
        }
    };

    public static fromDTO(dto : UserDTO) : User {
        return {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            username: dto.username,
            status: dto.status,
            password: dto.password,
            role: dto.role,
            id: dto.id,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }

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
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
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