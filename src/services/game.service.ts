import e from "express";
import { GameMapper } from "../mappers/game.mapper";
import { EGameStatus, Game, GameDBO, GameShortDTO, NewGame } from "../models/game.model";
import { isNumber } from "../utils/guards";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";

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
     * 
     * @param newGame 
     * @returns 
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

        /**
         * Creation of the new game by retrieve the info
         */
        const newGames : Game = {
            id: gameDBO.length + 1,
            status: gameStatus,
            name: newGame.name,
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
     * 
     * @param updatedGame 
     * @returns 
     */
    public static update(updatedGame : Game) : Game | undefined {
        let gameDBO : GameDBO[] = [];
        try {
            gameDBO = FilesService.readFile<GameDBO>(this.fileName);
        } catch (error) {
            LoggerService.error(`Error reading games file: ${error}`);
            return undefined;
        };

        // Find the game to update
        let gameFound = -1;
        for (let i = 0; i < gameDBO.length; i++) {
            if (gameDBO[i].id === updatedGame.id) {
                gameFound = i;
            };  
        };

        // Verify that the team exists
        if (gameFound === -1) {
            LoggerService.error(`Game with id ${updatedGame.id} not found`);
            return undefined;
        };

        // Verify the status of the game we want to update
        if (gameDBO[gameFound].status === EGameStatus.CANCELLED || gameDBO[gameFound].status === EGameStatus.FINISHED) {
            LoggerService.error('A finished or cancelled game cannot be updated');
            return undefined;
        };

        if (gameDBO[gameFound].status === EGameStatus.STARTED) {
            updatedGame.fieldId = gameDBO[gameFound].field_id;
            updatedGame.refereeId = gameDBO[gameFound].referee_id;
            updatedGame.homeTeamId = gameDBO[gameFound].home_team_id;
            updatedGame.awayTeamId = gameDBO[gameFound].away_team_id;
        };

        gameDBO[gameFound] = GameMapper.toGameDBO(updatedGame);

        // Save the file
        try {
            FilesService.writeFile<GameDBO>(this.fileName, gameDBO);
        } catch (error) {
            LoggerService.error(error);
            return undefined;
        };

        return updatedGame;
    };

    /**
     * 
     * @param id 
     * @returns 
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
     * 
     * @param id 
     * @param awayScore 
     * @param homeScore 
     * @returns 
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
     * 
     * @param id 
     * @param status 
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
