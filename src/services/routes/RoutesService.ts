import { log } from "../../helpers/Logger";
import { isLocation, isWaypointsArray, ILocation, IWaypoint, IRoute, IWinnerWithDelaysResponse, IWaypointInfo } from "./RoutesDefinitions";
import { RoutingStrategy, OSRMCarRoutingStrategy, FlightRoutingStrategy } from "./RoutingStrategy";

export class RoutesService {
    private routingStrategy: RoutingStrategy;
    private finishingRoutingStrategy: RoutingStrategy;

    public constructor(inRoutingStrategy?: RoutingStrategy) {
        this.routingStrategy = inRoutingStrategy || new OSRMCarRoutingStrategy();
        this.finishingRoutingStrategy = new FlightRoutingStrategy();
    }

    /**
     * Public method to find a best of all routes between origin and destination through waypoints and calculates delays for alternatives.
     * Performs validation checks
     * @throws Error if supplied parameters are wrong or there was unexpected error in computation
     * @returns WinnerWithDelaysResponse
     */
    public FindBestAlternative = async (origin: ILocation, destination: ILocation, time: number, waypoints: Array<IWaypoint>): Promise<IWinnerWithDelaysResponse> => {
        if (!isLocation(origin) || !isLocation(destination) || isNaN(time) || !isWaypointsArray(waypoints)) {
            throw new Error("Wrong input parameters for finding a route.");
        };
        log.debug(`Finding route from ${origin.lat},${origin.lon} to ${destination.lat},${destination.lon}`);
        waypoints.forEach((waypoint) => log.debug(`through waypoint: ${waypoint.lat},${waypoint.lon}`));

        return this.ComputeFindBestAlternative(origin, destination, time, waypoints);
    }

    /**
     * Private implementation method for computing the finding of routes
     */
    private ComputeFindBestAlternative = async (origin: ILocation, destination: ILocation, time: number, waypoints: Array<IWaypoint>): Promise<IWinnerWithDelaysResponse> => {

        let newWaypoints: Array<IWaypointInfo> = [];
        for (const singleWaypoint of waypoints) {
            const name = singleWaypoint.name;
            try {
                const route = await this.routingStrategy.FindSingleRoute(origin, destination, singleWaypoint);
                const positionAfterTime = await this.routingStrategy.FindPositionOnRouteInTime(route, time);
                const distance = await this.finishingRoutingStrategy.GetDistance(positionAfterTime, destination);
                const waypointInfo = {
                    name,
                    route,
                    positionAfterTime,
                    distance,
                };
                newWaypoints.push(waypointInfo);
            } catch (e) {
                if (e.message === RoutingStrategy.ROUTE_NOT_FOUND_ERROR_MESSAGE) {
                    continue;
                } else {
                    throw e;
                }
            }
        };
        newWaypoints.sort((prev, next) => {
            return prev.distance - next.distance;
        });
        const winner = newWaypoints[0];

        return {
            winner_name: winner.name,
            delays: {
                "placeholder_name": 0,
            },
        };
    }
}