import { log } from "../../helpers/Logger";
import { isLocation, isWaypointsArray, ILocation, IWaypoint, IWinnerWithDelaysResponse } from "./RoutesDefinitions";

export class RoutesService {
    /**
     * Public method to find a route between origin and destination
     * Performs validation checks
     * @throws Error if supplied parameters are wrong or there was unexpected error in computation
     * @returns WinnerWithDelaysResponse
     */
    public FindRoute = async (origin: ILocation, destination: ILocation, time: number, waypoints: Array<IWaypoint>): Promise<IWinnerWithDelaysResponse> => {
        if (!isLocation(origin) || !isLocation(destination) || isNaN(time) || !isWaypointsArray(waypoints)) {
            throw new Error("Wrong input parameters for finding a route.");
        }
        log.debug(`Finding route from ${origin.lat},${origin.lon} to ${destination.lat},${destination.lon}`);

        return this.ComputeFindRoute(origin, destination, time, waypoints);
    }

    /**
     * Private implementation method for computing the finding of routes
     */
    private ComputeFindRoute = async (origin: ILocation, destination: ILocation, time: number, waypoints: Array<IWaypoint>): Promise<IWinnerWithDelaysResponse> => {
        // TODO: Implementation
        return {
            winner_name: "A",
            delays: {
                "A": 0,
            }
        };
    }
}