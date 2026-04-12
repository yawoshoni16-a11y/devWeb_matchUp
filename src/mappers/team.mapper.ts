import { NewTeam, NewTeamDTO, Team, TeamDBO, TeamDTO, TeamShortDTO } from "../models/team.model";

/**
 * Mapper class to convert between Team and TeamDBO/TeamDTO/TeamShortDTO
 */
export class TeamMapper {
    public static toTeamDTO(team: Team): TeamDTO {
        return {
            id : team.id,
            name : team.name,
            description : team.description,
            sportType : team.sportType,
            players : team.players,
            trainerId : team.trainerId,
            createdAt : team.createdAt.toISOString(),
            updatedAt : team.updatedAt.toISOString()
        };
    };

    public static toTeamDBO(team: Team): TeamDBO {
        return {
            id : team.id,
            name : team.name,
            description : team.description,
            sport_type : team.sportType,
            players : team.players,
            trainer_id : team.trainerId,
            created_at : team.createdAt.toISOString(),
            updated_at : team.updatedAt.toISOString()
        };
    };

    public static toTeamShortDTO(team: Team): TeamShortDTO {
        return {
            id : team.id,
            name : team.name,
            sportType : team.sportType
        };
    };

    public static fromTeamDTO(dto: TeamDTO): Team {
        return {
            id : dto.id,
            name : dto.name,
            description : dto.description,
            sportType : dto.sportType,
            players : dto.players,
            trainerId : dto.trainerId,
            createdAt : new Date(),
            updatedAt : new Date()
        };
    };

    public static fromTeamDBO(dbo: TeamDBO): Team {
        return {
            id : dbo.id,
            name : dbo.name,
            description : dbo.description,
            sportType : dbo.sport_type,
            players : dbo.players,
            trainerId : dbo.trainer_id,
            createdAt : new Date(dbo.created_at),
            updatedAt : new Date(dbo.updated_at),
        };
    };

    public static fromNewteamDTO(dto: NewTeamDTO): NewTeam {
        return {
            name : dto.name,
            description : dto.description,
            sportType : dto.sportType
        };
    };
}