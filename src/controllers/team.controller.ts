import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { isString } from "../utils/guards";
import { Team, TeamShortDTO } from "../models/team.model";
import { TeamsServices } from "../services/team.service";
import { TeamMapper } from "../mappers/team.mapper";

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