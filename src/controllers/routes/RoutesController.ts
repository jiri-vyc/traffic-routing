import * as express from "express";
import { Router, Request, Response, NextFunction} from "express";
import { RoutesService } from "../../services";

export class RoutesController {
    public router: Router;
    protected service: RoutesService;

    public constructor() {
        this.router = express.Router();
        this.service = new RoutesService();
        this.router.get("/", this.FindRoute());
    }

    protected FindRoute = async (req: Request, res: Response, next: NextFunction) => {
        res.send("ok");
    }

}