import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { EGameStatus, Game, GameDTO, GameShortDTO, NewGame, NewGameDTO } from "../models/game.model";
import { GamesServices } from "../services/game.service";
import { GameMapper } from "../mappers/game.mapper";
import { isEGameStatus, isNewGameDTO, isNumber } from "../utils/guards";
import { AuthServices } from "../services/auth.service";
import { AuthenticatedRequest } from "../models/auth.model";

export const gameController = Router();

/**
 * Returns a short view of all upcoming, ongoing games(GameShortDTO). 
 * Only games whose scheduledDate is today or in the future are included; past games are excluded.
 */
gameController.get('/', (req: Request, res: Response) => {
    LoggerService.info('[GET] /games');

    // Retrieve all games from the service
    const games: Game[] = GamesServices.getAll();
    const result: GameShortDTO[] = [];

    // Travels every games returned by the server
    for (const game of games) {
        // Convert every Game in GameShortDTO with the mapper
        const gameShort: GameShortDTO = GameMapper.toGameShortDTO(game);
        result.push(gameShort);
    };

    return res.status(200).json(result);
});

/**
 * Returns the full representation of a single game by his ID (GameDTO).
 * No authentication required
 */
gameController.get('/:id', (req: Request, res: Response) => {
    LoggerService.info('[GET] /games/:id');

    const id = Number(req.params.id);
    /**
     * Verify the type of the ID 
     */
    if (!isNumber(id)) {
        LoggerService.error('Id must be a number');
        return res.status(400).send('Id must be a number');
    };

    /**
     * Verify if the team exists
     */
    const game: Game | undefined = GamesServices.getGameByID(id);
    if (game === undefined) {
        LoggerService.error('Game Id not found');
        return res.status(404).send('Game Id not found');
    };

    const gamesDTO: GameDTO = GameMapper.toGameDTO(game);
    return res.status(200).json(gamesDTO);
});

/**
 * 
 */
gameController.post('/', AuthServices.authorize, AuthServices.isReferee, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[POST] /games');

    // const {name, homeTeamId, awayTeamId, fieldId, scheduledDate} = req.body;

    // /**
    //  * Verify required fields
    //  */
    // if (!name || !homeTeamId || !awayTeamId || !fieldId || !scheduledDate) {
    //     LoggerService.error('Missing fields');
    //     return res.status(400).json('Invalid or missing fileds');
    // };

    // const newGame : NewGameDTO = {
    //     name,
    //     homeTeamId,
    //     awayTeamId,
    //     fieldId,
    //     refereeId,
    //     scheduledDate: scheduledDate,
    // }
    // const game : Game = GamesServices.create(newGame);
    
    const newGameDTO = req.body;
    if (!isNewGameDTO(newGameDTO)) {
        return res.status(400).send('Missing required fields');
    };

    const newGame: NewGame = GameMapper.fromNewGameDTO(newGameDTO);
    
    const gameCreated = GamesServices.create(newGame);
    if (!gameCreated) {
        return undefined;
    };
    return res.status(201).json(GameMapper.toGameDTO(gameCreated));
});

/**
 * 
 */
gameController.put('/:id', AuthServices.authorize, AuthServices.isReferee, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PUT] /games/:id');

    const id = Number(req.params.id);
    const gameUpdate = req.body;

    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number');
    };

    if (gameUpdate.id !== id) {
        LoggerService.error('Mismatch ID');
        return res.status(400).json('Missmatch ID');
    };

    // const game : Game = GamesServices.update();
    
    // if (!game) {
    //     LoggerService.error('Game not found');
    //     return res.status(400).json('Game not found');
    // }
});

/**
 * 
 */
gameController.delete('/:id', AuthServices.authorize, AuthServices.isAdmin, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[DELETE] /games/:id');

    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number');
    };

    const deletedGame: boolean = GamesServices.delete(id);
    if (!deletedGame) {
        LoggerService.error(`Game with id ${id} not found or failed to delete`);
        return res.status(400).json('Invalid ID');
    };

    return res.status(204).send();
});

/**
 * 
 */
gameController.patch('/:id/score/:home/:away', AuthServices.authorize, AuthServices.isReferee, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /games/:id/score/:home/:away');

    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number');
    };

    // Verify the type of homeScore and awayScore
    const homeScore = Number(req.params.home);
    const awayScore = Number(req.params.away);
    if (!isNumber(homeScore) || !isNumber(awayScore)) {
        LoggerService.error('HomeScore and awayScore must be a number');
        return res.status(400).json('HomeScore and awayScore must be a number');
    };

    // Function Number.isInteger() verify if the number is an integer or a decimal number
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
        LoggerService.error('HomeScore and awayScore must be an integer number');
        return res.status(400).json('HomeScore and awayScore must be an integer number');
    };
    
    // Because the fact that scoreUpdated can be undefined, we add it in the declaration
    const scoreUpdated : Game | undefined = GamesServices.updateScore(id, homeScore, awayScore);
    if (!scoreUpdated) {
        LoggerService.error('Game not found');
        return res.status(400).json('Game not found');
    };

    return res.status(200).json(GameMapper.toGameDTO(scoreUpdated));
});

/**
 * 
 */
gameController.patch('/:id/status/:status', AuthServices.authorize, AuthServices.isAdminOrRefereeOrTrainer, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /games/:id/status/:status');
    
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number');
    };

    const gameStatus = req.params.status;
    if (!isEGameStatus(gameStatus)) {
        LoggerService.error('Status must be a valid one');
        return res.status(400).json('Status is not valid');
    };

    const updatedGame: Game | undefined = GamesServices.updateStatus(id, gameStatus);

    // 
    if (!updatedGame) {
        LoggerService.error('Invalid or disallowed status transition, or missing prerequisites for starting');
        return res.status(400).json('Invalid or disallowed status transition, or missing prerequisites for starting');
    };

    return res.status(200).json(GameMapper.toGameDTO(updatedGame));
});