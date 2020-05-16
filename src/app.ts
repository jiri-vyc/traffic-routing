import * as express from "express";
import * as httpLogger from "morgan";
import { Request, Response, NextFunction} from "express";
import { config } from "./config/config";
import { HealthCheckController, RoutesController } from "./controllers";
import { log } from "./helpers";
import { handle } from "./helpers";
import { AuthenticationMiddleware } from "./middlewares";

/**
 * Entry point of the application. Creates and configures an ExpressJS web server.
 */
export class App {
    // Create a new express application instance
    protected express: express.Application;
    // The port the express app will listen on
    protected port: number;

    /**
     * Runs configuration methods on the Express instance
     */
    constructor() {
        this.port = parseInt(config.port || "3004", 10)
        this.express = express();
    }

    // Starts the application and runs the server
    public start = async (): Promise<void> => {
        try {
            await this.database();
            await this.middleware();
            await this.routes();
            this.express.listen(this.port, () => {
                log.info(`Listening at: ${this.port}`);
            });
        } catch (err) {
            // TODO ErrorHandler.handle(err);
        }
    }

    private setHeaders = (req: Request, res: Response, next: NextFunction): void => {
        res.setHeader("x-powered-by", "hidden");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD, PUT, POST");
        next();
    }

    /**
     * Setup the connection to the database
     */
    private database = async (): Promise<void> => {
        // TODO const mongoUri: string = config.mongo_connection || "";
        // await mongooseConnection;
    }

    /**
     * Setup all the (general) middlewares
     */
    private middleware = (): void => {
        this.express.use(httpLogger("combined"));
        this.express.use(new AuthenticationMiddleware().authenticate);
        this.express.use(this.setHeaders);
    }

    private routes = (): void => {
        // Create specific routes with their own router
        this.express.use("/", new HealthCheckController().router);
        this.express.use("/routes", new RoutesController().router);


        // Not found error - no route was matched
        this.express.use((req: Request, res: Response, next: NextFunction) => {
            next({status: 404, message: "Not Found."});
        });

        // Error handler to catch all errors sent by routers (propagated through next(err))
        this.express.use((err: any, req: Request, res: Response, next: NextFunction) => {
            handle(err);
            let errObject: { status: number, message: string } = {
                status: err.status ? err.status : 500,
                message: err.message ? err.message : "Unknown Server Error",
            };
            log.silly("Error caught by the router error handler.");
            res.status(errObject.status || 500).send(errObject);
        });
    }
}
