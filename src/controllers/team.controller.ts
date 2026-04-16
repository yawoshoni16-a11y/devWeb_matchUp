import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { isNumber, isString } from "../utils/guards";
import { NewTeam, Team, TeamDTO, TeamFull, TeamFullDTO, TeamShortDTO } from "../models/team.model";
import { TeamsServices } from "../services/team.service";
import { TeamMapper } from "../mappers/team.mapper";
import { AuthServices } from "../services/auth.service";
import { AuthenticatedRequest } from "../models/auth.model";

export const teamController = Router();

/**
 * Returns a short view of all teams (TeamShortDTO): id, name, and sportType only. 
 * Does not include player lists or trainer details.
 */
teamController.get('/', (req: Request, res: Response) => {
    LoggerService.info('[GET] /teams/');

    // Retrieve all teams from the service (returns Team[])
    const teams: Team[] = TeamsServices.getAll();

    // Convert each Team to a TeamShortDTO using the mapper with a "for loop"
    const teamsDTO: TeamShortDTO[] = [];
    for (let i = 0; i < teams.length; i++) {
        teamsDTO.push(TeamMapper.toTeamShortDTO(teams[i]));
    };

    // Return the list with statuts 200
    res.status(200).json(teamsDTO);
});

/**
 * Creates a new team (trainer only).
 * Requires a valid trainer token. The trainerId is automatically set from the authenticated user.
 * The new team is initialized with an empty player list.
 * @returns 201 with the created Team, 400 if fields are missing, 401 if not authenticated, 403 if not a trainer.
 */
teamController.post('/', AuthServices.authorize, AuthServices.isTrainer, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[POST] /teams/');

    // Retrieve the authenticated trainer from req.user
    const trainer = req.user;

    // Build the NewTeam using the body and trainerId of the connected trainer
    const newTeam: NewTeam = {
        name: req.body.name,
        description: req.body.description,
        sportType: req.body.sportType,
    };

    // Validate required fields
    if (!newTeam.name || !newTeam.description || !newTeam.sportType) {
        return res.status(400).json('Invalid or missing fields');
    };

    // Create the team through the service
    const team = TeamsServices.create(newTeam, trainer!.id);

    // Return the team created with status 201
    res.status(201).json(team);
});

/**
 * Returns the full representation of all teams the authenticated user belongs to
 * Returns an empty array if the user is not in any team.
 * @returns 200 with a list of TeamFull, 401 if not authenticated.
 */
teamController.get('/own', AuthServices.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[GET] /users/own');

    const user = req.user;
    if (!user) {
        return undefined;
    }
    // Récupérer les équipes du user connecté
    const teams: TeamFull[] = TeamsServices.getOwn(user.id);


    // Convertir en TeamFullDTO via le mapper
    const teamsDTO: TeamFullDTO[] = [];
    for (let i = 0; i < teams.length; i++) {
        const dto = TeamMapper.toFullTeam(teams[i]);
        if (dto !== undefined) {
            teamsDTO.push(dto);
        };
    };

    return res.status(200).json(teamsDTO);
});

/**
 * This route returns the team that match with the ID
 */
teamController.get('/id/:id', (req: Request, res: Response) => {
    LoggerService.info('[GET] /teams/id/:id');
    
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
    const team: Team | undefined = TeamsServices.getByTeamId(id);
    if (team === undefined) {
        LoggerService.error('Id not found');
        return res.status(404).send('Id not found');
    };

    const teamsDTO: TeamDTO = TeamMapper.toTeamDTO(team);
    return res.status(200).json(teamsDTO);
});

/**
 * Updates a team (trainer only).
 * The body id must match the path id. Body must include players and trainerId.
 * The trainer must be the trainer of the team.
 * @returns 200 with the updated Team, 400 if invalid payload or ID mismatch, 401 if not authenticated, 403 if not a trainer or not the trainer of this team, 404 if team not found.
 */
teamController.put('/:id', AuthServices.authorize, AuthServices.isTrainer, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PUT] /teams/:id');

    const teamDTO = req.body;
    const trainer = req.user;
    if (!trainer) {
        return undefined;
    };

     // Retrieve the ID and verify the type
    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('Invalid ID : it must be a number');
        return res.status(400).json('ID must be a number');
    };

    // Verify that body id matches URL id
    if (teamDTO.id !== id) {
        LoggerService.error('ID does not match with the URL id');
        return res.status(400).json('Invalid ID mismatch');
    };

    // Verify that players and trainerId are present
    if (!teamDTO.players || !teamDTO.trainerId) {
        LoggerService.error('Missing required fields: players or trainerId');
        return res.status(400).json('Players or TrainerId is missing');
    };

    // Verify the team
    const existingTeam = TeamsServices.getByTeamId(id);
    if (!existingTeam) {
        LoggerService.error('Team not found');
        return res.status(404).json('Team not found');
    };

    // Verify that the connected trainer is indeed this team's trainer
    if (existingTeam.trainerId !== trainer.id) {
        LoggerService.error('Authenticated user is not the trainer of this team');
        return res.status(403).json('Authenticated user is not the trainer of this team');
    };

    // Update the team
    const teamUpdated: Team = {
        id: id,
        name: teamDTO.name,
        description: teamDTO.description,
        sportType: teamDTO.sportType,
        players: teamDTO.players,
        trainerId: teamDTO.trainerId,
        createdAt: existingTeam.createdAt,
        updatedAt: new Date()
    };

    // Update using the service
    const team = TeamsServices.update(id, teamUpdated);
    if (!team) {
        LoggerService.error('Update failed: team name may already be taken');
        return res.status(400).json('Update failed');
    };

    // Return the updated team
    res.status(200).json(TeamMapper.toTeamDTO(team));
});

/**
 * 
 */
teamController.patch('/:id/join', AuthServices.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /teams/:id/join');

    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number');
    };

    const user = req.user;
    if (!user) return res.status(401).send("unauthorize");

    const userId = user.id;

    const result = TeamsServices.joinTeam(id, userId);
    if (result === undefined) {
        LoggerService.error('Team not found or User already in the team');
        return res.status(404).json('Team not found');
    };

    return res.status(200).json(TeamMapper.toTeamDTO(result));
});

/**
 * 
 */
teamController.patch('/:id/leave', AuthServices.authorize, (req: AuthenticatedRequest, res: Response) => {
    LoggerService.info('[PATCH] /teams/:id/leave');

    const id = Number(req.params.id);
    if (!isNumber(id)) {
        LoggerService.error('ID must be a number');
        return res.status(400).json('ID must be a number');
    };

    const user = req.user;
    if (!user) return res.status(401).send('Unauthorize');

    const userId = user.id;

    const result = TeamsServices.leaveTeam(id, userId);
    if (result === undefined) {
        LoggerService.error('Team not found or user not in team');
        return res.status(404).json('Team not found or user not in team');
    };

    return res.status(200).json(TeamMapper.toTeamDTO(result));
});