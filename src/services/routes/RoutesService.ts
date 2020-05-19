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
        waypoints.forEach((waypoint) => log.debug(`through waypoint: ${waypoint.lat},${waypoint.lon} (${waypoint.name})`));

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

        let delays: {
            [key: string]: number,
        } = {};

        // Calculate delays here
        for (const singleWaypoint of newWaypoints) {
            delays[singleWaypoint.name] = await this.FindTimeUntilPositionTo(destination, singleWaypoint.route, winner.distance, time);
        }

        return {
            winner_name: winner.name,
            delays,
        };
    }

    /**
     * Reversely finds the time at which the car on the route will have the desired distance (targetDistance) to target destination. At refTime at the earliest.
     */
    private FindTimeUntilPositionTo = async (destination: ILocation, route: IRoute, targetDistance: number, refTime: number): Promise<number> => {
        const allDurations = this.routingStrategy.GetAllSegmentDurations(route);
        let currentTime = 0;
        for (const i in allDurations) {
            const currentLocation = { lat: route.geometry.coordinates[i][1], lon: route.geometry.coordinates[i][0] };
            const distanceToDestination = await this.finishingRoutingStrategy.GetDistance(currentLocation, destination);
            // currentTime >= refTime because car could've been closer to destination earlier on route, so disregarding those
            if (distanceToDestination <= targetDistance && currentTime >= refTime) {
                break;
            }
            currentTime += allDurations[i];
        }
        const returnTime = this.RoundToMinutes(currentTime - refTime);
        return returnTime;
    }

    private RoundToMinutes = (timeInSeconds: number) => {
        return timeInSeconds - (timeInSeconds % 60);
    }
}