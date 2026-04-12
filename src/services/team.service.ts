import { truncateSync } from "node:fs";
import { Team, TeamDBO } from "../models/team.model"
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UserMapper } from "../mappers/user.mapper";
import { TeamMapper } from "../mappers/team.mapper";

export class TeamsServices {
    private static fileName = 'data/teams.json'

    public static getAll() : Team[] {
        let data : TeamDBO[] = [];

        try {
            data = FilesService.readFile<TeamDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return[];
        };

        const results : Team[] = [];
        for (let i = 0; i < data.length; i++) {
            results.push(TeamMapper.fromTeamDBO(data[i]));
        };
        
        return results;
    };
}