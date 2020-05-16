import { Request, Response, NextFunction} from "express";
import { ConfigurationService } from "../services";

export class AuthenticationMiddleware {
    public authenticate = async (req: Request, res: Response, next: NextFunction) => {
        const secretHeader = req.headers["x-secret"];
        const configService = new ConfigurationService();
        const globalPassword = await configService.GetGlobalPassword();
        if (secretHeader !== globalPassword) {
            next({status: 401, message: "Unauthorized"});
        } else {
            next();
        }
    }
}