import e from "express";
import { GameMapper } from "../mappers/game.mapper";
import { EGameStatus, Game, GameDBO, GameShortDTO, NewGame } from "../models/game.model";
import { isNumber } from "../utils/guards";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { TeamDBO } from "../models/team.model";

export class GamesServices {
    private static fileName = 'data/games.json'; 

    /**
     * Retrieves all upcoming and ongoing games.
     * Only games whose scheduledDate is today or in the future are included; 
     * past games are excluded.
     * @returns a list of upcoming and ongoing games
     */
    public static getAll() : Game[] {
        let gameDBO : GameDBO[] = [];
        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading games file: ${error}`);
            return[];
        };

        // Retrieve the actual Date to compare with the game's Date
        const nowDate = new Date();
        const result: Game[] = [];

        // The comparaison
        for (const games of gameDBO) {
            const game: Game = GameMapper.fromGameDBO(games);
            if (game.scheduledDate) {
                const gameDate = new Date(game.scheduledDate);
                if (gameDate >= nowDate) {
                    result.push(game);
                };
            };
        };
        return result;
    };

    /**
     * Retrieves a specific game by its ID.
     * @param id - The ID of the game to find
     * @returns A Game instance if found, or undefined if the game does not exist
     */
    public static getGameByID(id: number) : Game | undefined {
        let gameDBO : GameDBO[] = [];

        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading games file: ${error}`);
            return undefined;
        };

        for (let i = 0; i < gameDBO.length; i++) {
            if (isNumber(id) && gameDBO[i].id === id) {
                // Convert the database object (DBO) to Domain Model (Game)
                return GameMapper.fromGameDBO(gameDBO[i]);
            }; 
        };
        return undefined;
    };

    /**
     * Create a new game 
     * @param newGame 
     * @returns undefined if the creation of the game is not possible
     */
    public static create(newGame :  NewGame) : Game | undefined {
        let gameDBO : GameDBO[] = [];
        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading games file: ${error}`);
            return undefined;
        };

        /**
         * If fieldId AND scheduledDate are present → scheduled,
         * otherwise → created
         */ 
        let gameStatus: EGameStatus;
        if (newGame.fieldId && newGame.scheduledDate) {
            gameStatus = EGameStatus.SCHEDULED;
        } else {
            gameStatus = EGameStatus.CREATED;
        };

        // ID calculation
        let maxId = 0;
        for (let i = 0; i < gameDBO.length; i++) {
            if (gameDBO[i].id > maxId) {
                maxId = gameDBO[i].id;
            };
        };

        /**
         * Creation of the new game by retrieve the info
         */
        const newGames : Game = {
            id: maxId + 1,
            name: newGame.name,
            status: gameStatus,
            fieldId: newGame.fieldId,
            refereeId: newGame.refereeId,
            homeTeamId: newGame.homeTeamId,
            awayTeamId: newGame.awayTeamId,
            homeScore: 0,
            awayScore: 0,
            scheduledDate: new Date().toISOString(),
            createdAt : new Date(),
            updatedAt : new Date(),
        };
        
        console.log(JSON.stringify(newGames));
        /**
         * Convert to DBO and push to the table
         */
        const newGameDBO: GameDBO = GameMapper.toGameDBO(newGames);
        gameDBO.push(newGameDBO);

        /**
         * Save in the JSON file
         */
        try {
            FilesService.writeFile<GameDBO>(this.fileName, gameDBO);
        } catch (error) {
            LoggerService.error(`Error writing games file: ${error}`);
            return undefined;
        };
        return newGames;
    };

    /**
     * Update the information of a game
     * @param updatedGame 
     * @returns undefined if the conditions aren't good, otherwise the game can be updated
     */
    public static update(updatedGame : Game) : Game | undefined {
        let gameDBO : GameDBO[] = [];
        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading games file: ${error}`);
            return undefined;
        };

        // Found the game
        let gameFound = -1;
        for (let i = 0; i < gameDBO.length; i++) {
            if (gameDBO[i].id === updatedGame.id) {
                gameFound = i;
            };
        };
        LoggerService.debug("ici1") ;
        if (gameFound === -1) {
            LoggerService.error(`Game with id ${updatedGame.id} not found`);
            return undefined;
        };
        LoggerService.debug("ici2");
        // Verify if the sport of the homeTeam is the same as the awayTeam
        if (updatedGame.homeTeamId && updatedGame.awayTeamId) {
            // Retrieves the homeTeam and awayTeam
            let homeTeam: TeamDBO | undefined;
            let awayTeam: TeamDBO | undefined;
            let teamsDBO: TeamDBO[] = [];
            try {
                teamsDBO = FilesService.readFile<TeamDBO>(this.fileName);
            } catch (error) {
                LoggerService.error(`Error reading teams file: ${error}`);
                return undefined;
            };
            LoggerService.debug("ici3")
            for (let i = 0; i < teamsDBO.length; i++) {
                // Verify if the team is the homeTeam
                if (teamsDBO[i].id === updatedGame.homeTeamId) {
                    homeTeam = teamsDBO[i];
                };

                // Verify if the team is the awayTeam
                if (teamsDBO[i].id === updatedGame.awayTeamId) {
                    awayTeam = teamsDBO[i];
                };
            };

            // Error if the teams are not found
            if (!homeTeam || !awayTeam) {
                LoggerService.error(`One or both teams not found`);
                return undefined;
            };
            LoggerService.debug("ici4")

            // Error if the teams don't have the same sport
            if (homeTeam.sport_type !== awayTeam.sport_type) {
                LoggerService.error(`Teams do not play the same sport: ${homeTeam.sport_type} vs ${awayTeam.sport_type}`);
                return undefined;
            };
            LoggerService.debug("ici5")
            try {
                FilesService.writeFile<TeamDBO>(this.fileName, teamsDBO);
            } catch (error) {
                LoggerService.error(`Error ${error} writing in teams file`);
                return undefined;
            };
        };
        LoggerService.debug("ici6")
        // finished or cancelled -> can not be modified
        if (gameDBO[gameFound].status === EGameStatus.CANCELLED || gameDBO[gameFound].status === EGameStatus.FINISHED) {
            LoggerService.error('A finished or cancelled game cannot be updated');
            return undefined;
        };
        LoggerService.debug("ici7")
        // started -> fieldId, refereeId, homeTeamId, awayTeamId can not changed
        if (gameDBO[gameFound].status === EGameStatus.STARTED) {
            updatedGame.fieldId = gameDBO[gameFound].field_id;
            updatedGame.refereeId = gameDBO[gameFound].referee_id;
            updatedGame.homeTeamId = gameDBO[gameFound].home_team_id;
            updatedGame.awayTeamId = gameDBO[gameFound].away_team_id;
        };

        // Verify the field is already booked for that date
        if (updatedGame.fieldId && updatedGame.scheduledDate) {
            const scheduledDay = new Date(updatedGame.scheduledDate);

        for (let i = 0; i < gameDBO.length; i++) {
            // We ignored the game that we are changing
            if (gameDBO[i].id === updatedGame.id){
                continue;
            };

            // We ignored when the games in status canceled or finished
            if (gameDBO[i].status === EGameStatus.CANCELLED || gameDBO[i].status === EGameStatus.FINISHED) {
                continue;
            };

            if (!gameDBO[i].scheduled_date) {
                return undefined;
            };
            const existingDay = new Date(gameDBO[i].scheduled_date!);
            
            // Check if the field is already booked for that date
            if (gameDBO[i].field_id === updatedGame.fieldId && existingDay.getTime() === scheduledDay.getTime()) {
                LoggerService.error(`Field ${updatedGame.fieldId} is already booked for ${scheduledDay}`);
                return undefined;
            };
        };
    };

        // Update of the status 
        if (updatedGame.fieldId && updatedGame.scheduledDate && gameDBO[gameFound].status === EGameStatus.CREATED) {
            updatedGame.status = EGameStatus.SCHEDULED;
        };

        gameDBO[gameFound] = GameMapper.toGameDBO(updatedGame);

        try {
            FilesService.writeFile<GameDBO>(this.fileName, gameDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        return updatedGame;
    };

    /**
     * Delete a game permanently from our data center (hard delete)
     * @param id - The ID of the game we want to delete
     * @returns true if the delete action is done, otherwise false
     */
    public static delete(id: number) : boolean {
        let gameDBO : GameDBO[] = [];
        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading games file: ${error}`);
            return false;
        };

        let gameIndex = -1;
        for (let i = 0; i < gameDBO.length; i++) {
            if (gameDBO[i].id === id) {
                gameIndex = i;
            }; 
        };

        // If the game doesn't exists -> return undefined
        if (gameIndex === -1) {
            LoggerService.error(`Game with id ${id} not found`);
            return false;
        };

        // Hard Delete the game
        // splice(index, 1) : 1 allows to delete one element 
        gameDBO.splice(gameIndex, 1);

        // save in the file
        try {
            FilesService.writeFile<GameDBO>(this.fileName, gameDBO);
        } catch (error) {
            LoggerService.error(error);
            return false;
        };
        return true;
    };

    /**
     * Patch : allow us to change the score of a game
     * @param id - The ID of the game we want to change the score of
     * @param awayScore - The score of the away team
     * @param homeScore - The score of the home team
     * @returns the update of the score, otherwise undefined if it is not possible
     */
    public static updateScore(id: number, homeScore: number, awayScore: number) : Game | undefined {
        let gameDBO : GameDBO[] = [];
        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading games file: ${error}`);
            return undefined;
        };

        // Find the game with the correspondant id
        let gameIndex = -1;
        for (let i = 0; i < gameDBO.length; i++) {
            if (gameDBO[i].id === id) {
                gameIndex = i;
            };
        };

        // If the id doesn't match the path id
        if (gameIndex === -1) {
            LoggerService.error(`Game with id : ${id} not found in the database`);
            return undefined;
        };

        // Verify if the game is on started status
        if (gameDBO[gameIndex].status !== EGameStatus.STARTED) {
            LoggerService.error(`Game with id: ${id} is not in status started`);
            return undefined;
        };

        // Update scores of games 
        gameDBO[gameIndex].home_score = homeScore;
        gameDBO[gameIndex].away_score = awayScore;

        // Save in file
        try {
            FilesService.writeFile<GameDBO>(this.fileName, gameDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        return GameMapper.fromGameDBO(gameDBO[gameIndex]);
    };

    /**
     * Patch : update the status of a game
     * @param id - The ID of the game we want to change the status of
     * @param status - The "new" status of the game 
     */
    public static updateStatus(id: number, status: EGameStatus) : Game | undefined {
        let gameDBO : GameDBO[] = [];
        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        // Find the index of the game
        let gameIndex = -1;
        for (let i = 0; i < gameDBO.length; i++) {
            if(gameDBO[i].id === id) {
                gameIndex = i;
            };
        };

        // Game not found
        if (gameIndex === -1) {
            LoggerService.error('Game not found');
            return undefined;
        };

        const currentStatus = gameDBO[gameIndex].status;

        // Verify autorised transitions
        if (currentStatus === EGameStatus.SCHEDULED && status === EGameStatus.STARTED) {
            const game = gameDBO[gameIndex];
            if (!game.field_id || !game.referee_id || !game.home_team_id || !game.away_team_id || game.home_score !== 0 || game.away_score !== 0) {
                LoggerService.error('Missing requeried fields for starting the game');
                return undefined;
            };

        } else if (currentStatus === EGameStatus.CREATED && status === EGameStatus.CANCELLED) {
            // Valid transition

        } else if (currentStatus === EGameStatus.SCHEDULED && status === EGameStatus.CANCELLED) {
            // Valid transition

        } else if (currentStatus === EGameStatus.STARTED && status === EGameStatus.FINISHED) {
            // Valid transition

        } else {
            // Other transitions must be forbidden
            LoggerService.error(`Invalid status transition from ${currentStatus} to ${status}`);
            return undefined;
        };

        // Update of the status
        gameDBO[gameIndex].status = status;

        // Save in file
        try {
            FilesService.writeFile<GameDBO>(this.fileName, gameDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };
        return GameMapper.fromGameDBO(gameDBO[gameIndex]);
    };
}
