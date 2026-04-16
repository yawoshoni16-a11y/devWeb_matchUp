import { truncateSync } from "node:fs";
import { NewTeam, Team, TeamDBO, TeamFull, TeamFullDTO } from "../models/team.model"
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UserMapper } from "../mappers/user.mapper";
import { TeamMapper } from "../mappers/team.mapper";
import { UsersServices } from "./user.service";
import { User, UserDBO } from "../models/user.model";
import { isNumber } from "../utils/guards";

export class TeamsServices {
    private static fileName = 'data/teams.json'

    /**
     * Function that allows everybody to get a short view of all teams
     * @returns TeamShortDTO
     */
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

    /**
     * Function that allows authenticated user to get a representation view of their own teams
     * @returns TeamFullDTO
     */
    public static getOwn(userId : number) : TeamFull[] {
        let data : TeamDBO[] = [];

        try {
            data = FilesService.readFile<TeamDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return[];
        };

        const results: TeamFull[] = [];


        for (let i = 0; i < data.length; i++) {
            // le user fait-il partie de l'equipe
            // si non -> next
            // si oui alors ...
            // Vérifier si le user est player ou trainer de cette équipe
            const isPlayer = data[i].players.includes(userId);
            const isTrainer = data[i].trainer_id === userId;

            if (isPlayer || isTrainer) {
                const users: User[] =[];

                const players: User[] =[];
                for (const id of data[i].players) {
                    const p = UsersServices.getById(id);
                    // if(p === undefined) continue;
                    // players.push(p);
                    if(p !== undefined) players.push(p);
                };
                const trainer : User | undefined = UsersServices.getById(data[i].trainer_id);
                if (trainer !== undefined) {
                    const teamFull: TeamFull = {
                    id: data[i].id,
                    description: data[i].description,
                    sportType: data[i].sport_type,
                    players : players,
                    trainer : trainer,
                    name: data[i].name,
                    createdAt: new Date(data[i].created_at),
                    updatedAt: new Date(data[i].updated_at)
                };
                results.push(teamFull);
                };
            };
        };

        return results;
    };

    /**
     * Function that allows everybody to get a team info by his id
     */
    public static getByTeamId(id : number) : Team | undefined {
        let teamDBO : TeamDBO[] = [];

        try {
            teamDBO = FilesService.readFile<TeamDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading users file: ${error}`);
            return undefined;
        };

        for (let i = 0; i < teamDBO.length; i++) {
            if (isNumber(id) && teamDBO[i].id === id) {
                return TeamMapper.fromTeamDBO(teamDBO[i]);
            }; 
        };
        return undefined;
    };

    /**
     * Creates a new team and saves it to the data file.
     * The trainerId is provided by the caller (from the authenticated user, not the request body).
     * The new team is initialized with an empty player list and auto-generated id, createdAt and updatedAt.
     * @param team - The new team data (name, description, sportType)
     * @param trainerId - The id of the authenticated trainer
     * @returns The created Team, or undefined if a file read/write error occurs.
     */
    public static create(team : NewTeam, trainerId : number) : Team | undefined {
        let teamDBO : TeamDBO[] = [];
        try {
            teamDBO = FilesService.readFile<TeamDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading teams file: ${error}`);
            return undefined;
        };

        // ID calculation
        let maxId = 0;
        for (let i = 0; i < teamDBO.length; i++) {
            if (teamDBO[i].id > maxId) {
                maxId = teamDBO[i].id;
            };
        };

        // Gives a new ID to the new Team
        const newTeam: Team = {
            ...team,
            id: maxId + 1,
            trainerId: trainerId,
            players: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Convert to DBO
        const newTeamDBO = TeamMapper.toTeamDBO(newTeam);
        teamDBO.push(newTeamDBO);

        // Write in the file
        try {
            FilesService.writeFile<TeamDBO>(this.fileName, teamDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };
        return newTeam;
    };

    /**
     * Updates a team with the provided values.
     * @param id - The id of the team to update
     * @param teamUpdated - The new team data
     * @returns The updated Team, or undefined if a file read/write error occurs.
     */
    public static update(id: number, teamUpdated: Team) : Team | undefined {
        let teamDBO : TeamDBO[] = [];
        try {
            teamDBO = FilesService.readFile<TeamDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        // Verify if the new name is not already used
        for (let i = 0; i < teamDBO.length; i++) {
            if (teamDBO[i].name === teamUpdated.name && teamDBO[i].id !== id) {
                return undefined;
            };
        };

        // Find the index of the team we want to update
        for (let i = 0; i < teamDBO.length; i++) {
            if (teamDBO[i].id === id) {
                
                // Update all fields 
                teamDBO[i].description = teamUpdated.description;
                teamDBO[i].name = teamUpdated.name;
                teamDBO[i].players = teamUpdated.players;
                teamDBO[i].sport_type = teamUpdated.sportType;
                teamDBO[i].updated_at = new Date().toISOString();

                // Save file 
                try {
                    FilesService.writeFile<TeamDBO>(this.fileName, teamDBO);
                } catch (error) {
                    LoggerService.error(error);
                    return undefined;
                };
                
                // Return the updated team
                return teamUpdated;
            };
        };
        return undefined;
    };

    /**
     * 
     * @param id 
     * @param userId 
     * @returns 
     */
    public static joinTeam(id: number, userId: number) : Team | undefined {
        let teamDBO : TeamDBO[] = [];
        try {
            teamDBO = FilesService.readFile<TeamDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        // Find the team
        let teamIndex = -1;
        for (let i = 0; i < teamDBO.length; i++) {
            if (teamDBO[i].id === id) {
            teamIndex = i;
            };
        };

        // Verify that the team exists
        if (teamIndex === -1) {
            return undefined; 
        };

        // Verify if the player is already in the team
        if (teamDBO[teamIndex].players.includes(userId)) {
            return undefined;
        };

        // If all restreints are passed, push the new player
        teamDBO[teamIndex].players.push(userId);

        // Save the file
        try {
            FilesService.writeFile<TeamDBO>(this.fileName, teamDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        return TeamMapper.fromTeamDBO(teamDBO[teamIndex]);
    };

    /**
     * 
     * @param id 
     * @param userId 
     * @returns 
     */
    public static leaveTeam(id: number, userId: number) : Team | undefined {
        let teamDBO : TeamDBO[] = [];
        try {
            teamDBO = FilesService.readFile<TeamDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        // Find the team
        let teamIndex = -1;
        for (let i = 0; i < teamDBO.length; i++) {
            if (teamDBO[i].id === id) {
            teamIndex = i;
            };
        };

        // Verify that the team exists
        if (teamIndex === -1) {
            return undefined; 
        };

        // Verify if the player is not in the team
        if (!teamDBO[teamIndex].players.includes(userId)) {
            return undefined;
        };

        // If all restreints are passed, splice the player of the team
        // 1 bcs the methode splice would delete every elements in the table
        // from that position and that's not what we want
        const playerIndex = teamDBO[teamIndex].players.indexOf(userId);
        teamDBO[teamIndex].players.splice(playerIndex, 1);

        // Save in the file
        try {
            FilesService.writeFile<TeamDBO>(this.fileName, teamDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        return TeamMapper.fromTeamDBO(teamDBO[teamIndex]);
    };
}