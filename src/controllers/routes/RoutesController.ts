import * as express from "express";
import { Router, Request, Response, NextFunction} from "express";
import { RoutesService, ILocation, IWaypoint } from "../../services/routes";
import { body } from "express-validator";
import { checkErrors } from "../../helpers/Validation"

export class RoutesController {
    public router: Router;
    protected service: RoutesService;

    public constructor() {
        this.router = express.Router();
        this.service = new RoutesService();
        this.router.post("/", 
            body("origin.lat").exists().isNumeric(),
            body("origin.lon").exists().isNumeric(),
            body("destination.lat").exists().isNumeric(),
            body("destination.lon").exists().isNumeric(),
            body("time").exists().isNumeric(),
            body("waypoints").isArray(),
            body("waypoints.*.name").isString(),
            body("waypoints.*.lat").isNumeric(),
            body("waypoints.*.lon").isNumeric(),
            checkErrors,
            this.FindRoute
        );
    }

    protected FindRoute = async (req: Request, res: Response, next: NextFunction) => {
        const origin: ILocation = req.body.origin;
        const destination: ILocation = req.body.destination;
        const time = req.body.time;
        const waypoints: IWaypoint[] = req.body.waypoints;
        try {
            res.send(await this.service.FindRoute(origin, destination, time, waypoints));
        } catch (err) {
            next(err);
        }
    }

}