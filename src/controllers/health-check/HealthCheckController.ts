import * as express from "express";
import { Router, Request, Response, NextFunction} from "express";
import { HealthCheckService } from "../../services";

export class HealthCheckController {
    public router: Router;
    protected service: HealthCheckService;

    public constructor() {
        this.router = express.Router();
        this.service = new HealthCheckService();
        this.router.get("/", this.GetHealthCheck);
    }

    protected GetHealthCheck = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.send(await this.service.GetStatus());
        } catch (err) {
            next(err);
        }
    }
}