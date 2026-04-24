import { Game, GameDBO, GameDTO, GameShortDTO, NewGameDTO, NewGame } from "../models/game.model";

/**
 * 
 */
export class GameMapper {
    public static toGameDTO(game: Game): GameDTO {
        return {
            id : game.id,
            status : game.status,
            name : game.name,
            fieldId : game.fieldId,
            refereeId : game.refereeId,
            homeTeamId : game.homeTeamId,
            awayTeamId : game.awayTeamId,
            homeScore : game.homeScore,
            awayScore : game.awayScore,
            scheduledDate : game.scheduledDate,
            createdAt : game.createdAt.toISOString(),
            updatedAt : game.updatedAt.toISOString()
        };
    };

    public static toGameDBO(game: Game): GameDBO {
        return {
            id : game.id,
            status : game.status,
            name : game.name,
            field_id : game.fieldId,
            referee_id : game.refereeId,
            home_team_id : game.homeTeamId,
            away_team_id : game.awayTeamId,
            home_score : game.homeScore,
            away_score : game.awayScore,
            scheduled_date : game.scheduledDate,
            created_at : game.createdAt.toISOString(),
            updated_at : game.updatedAt.toISOString()
        };
    };

    public static toGameShortDTO(game: Game): GameShortDTO {
        return {
            id : game.id,
            status : game.status,
            name : game.name,
            fieldId : game.fieldId,
            homeTeamId : game.homeTeamId,
            awayTeamId : game.awayTeamId,
            scheduledDate : game.scheduledDate
        };
    };

    public static fromGameDTO(dto: GameDTO): Game {
        return {
            id : dto.id,
            status : dto.status,
            name : dto.name,
            fieldId : dto.fieldId,
            refereeId : dto.refereeId,
            homeTeamId : dto.homeTeamId,
            awayTeamId : dto.awayTeamId,
            homeScore : dto.homeScore,
            awayScore : dto.awayScore,
            scheduledDate : dto.scheduledDate,
            createdAt : dto.createdAt ? new Date(dto.createdAt) : new Date(),
            updatedAt : dto.updatedAt ? new Date(dto.updatedAt) : new Date()
        };
    };

    public static fromGameDBO(dbo: GameDBO): Game {
        return {
            id : dbo.id,
            status : dbo.status,
            name : dbo.name,
            fieldId : dbo.field_id,
            refereeId : dbo.referee_id,
            homeTeamId : dbo.home_team_id,
            awayTeamId : dbo.away_team_id,
            homeScore : dbo.home_score,
            awayScore : dbo.away_score,
            scheduledDate : dbo.scheduled_date,
            createdAt : dbo.created_at ? new Date(dbo.created_at): new Date(),
            updatedAt : dbo.updated_at ? new Date(dbo.updated_at): new Date()
        };
    };

    public static fromNewGameDTO(dto: NewGameDTO): NewGame {
        return {
            name : dto.name,
            fieldId : dto.fieldId,
            refereeId : dto.refereeId,
            homeTeamId : dto.homeTeamId,
            awayTeamId : dto.awayTeamId,
            scheduledDate : dto.scheduledDate
        };
    };
}