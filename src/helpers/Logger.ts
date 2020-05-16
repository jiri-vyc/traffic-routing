import * as winston from "winston";
import { config } from "../config/config";

const logLevelToSet = config.log_level ? config.log_level.toLowerCase() : "info";

const logger = winston.createLogger({
    format: winston.format.cli(),
    level: logLevelToSet,
    transports: [
      new winston.transports.Console(),
    ]
  });

  export { logger as log};