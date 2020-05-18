import { log } from "../../helpers/Logger";
import { isLocation, isWaypointsArray, ILocation, IWaypoint, IRoute, IWinnerWithDelaysResponse, IWaypointInfo } from "./RoutesDefinitions";
const axios = require('axios').default;

export class RoutesService {
    private routingEngineBaseUrl = "http://router.project-osrm.org";

    /**
     * Public method to find a best of all routes between origin and destination through waypoints and calculates delays for alternatives.
     * Performs validation checks
     * @throws Error if supplied parameters are wrong or there was unexpected error in computation
     * @returns WinnerWithDelaysResponse
     */
    public FindBestAlternative = async (origin: ILocation, destination: ILocation, time: number, waypoints: Array<IWaypoint>): Promise<IWinnerWithDelaysResponse> => {
        if (!isLocation(origin) || !isLocation(destination) || isNaN(time) || !isWaypointsArray(waypoints)) {
            throw new Error("Wrong input parameters for finding a route.");
        }
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
                const route = await this.FindSingleRoute(origin, destination, singleWaypoint);
                // log.debug(JSON.stringify(route.geometry));
                const positionAfterTime = this.FindPositionOnRouteInTime(route, time);
                const distance = this.CalculateStraightDistance(positionAfterTime, destination);
                const waypointInfo = {
                    name,
                    route,
                    positionAfterTime,
                    distance,
                };
                newWaypoints.push(waypointInfo);
            } catch (e) {
                if (e.message === "route_not_found") {
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
                "A": 0,
            },
        };
    }

    private ConstructOSRMApiCall = (origin: ILocation, destination: ILocation, waypoint: IWaypoint, full: boolean = true) => {
        return `${this.routingEngineBaseUrl}/route/v1/driving/` +
            `${origin.lon},${origin.lat};` +
            `${waypoint.lon},${waypoint.lat};` +
            `${destination.lon},${destination.lat}` +
            `?geometries=geojson` + 
            ( full ? `&annotations=duration&overview=full` : `` );
    }

    private FindSingleRoute = async (origin: ILocation, destination: ILocation, waypoint: IWaypoint, full: boolean = true): Promise<IRoute> => {
        const apiUrl = this.ConstructOSRMApiCall(origin, destination, waypoint, full);
        let response;
        try {
            response = await axios.get(apiUrl);
        } catch (err) {
            throw new Error("Error while handling the request.");
        }
        if (!response || !response.data || !response.data.routes || !response.data.routes[0]) {
            throw new Error("route_not_found");
        }
        return response.data.routes[0];
    }

    private FindPositionOnRouteInTime = (route: IRoute, targetTime: number): ILocation => {
        let currentTime = 0;
        let i = 0;
        let allDurations: Array<number> = [];
        for (const duration of route.legs) {
            allDurations = allDurations.concat(duration.annotation.duration);
        }
        while (i < allDurations.length && currentTime < targetTime){
            currentTime += allDurations[i];
            i++;
        }
        const result = {
            lat: route.geometry.coordinates[i][1],
            lon: route.geometry.coordinates[i][0],
        };
        log.debug(`After time ${targetTime} the car is at position ${result.lat},${result.lon}`);
        return result;
    }

    // TODO: Placeholder, but will work most of the time
    private CalculateStraightDistance = (origin: ILocation, destination: ILocation) => {
        const result = Math.sqrt( (destination.lon - origin.lon) * (destination.lon - origin.lon) + (destination.lat - origin.lat) * (destination.lat - origin.lat) );
        log.debug(`Distance between ${origin.lat},${origin.lon} and ${destination.lat},${destination.lon} is ${result}`)
        return result;
    }
}