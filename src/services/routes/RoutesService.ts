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

        return this.ComputeFindBestAlternative(origin, destination, time, waypoints);
    }

    /**
     * Private implementation method for computing the finding of routes
     */
    private ComputeFindBestAlternative = async (origin: ILocation, destination: ILocation, time: number, waypoints: Array<IWaypoint>): Promise<IWinnerWithDelaysResponse> => {

        let newWaypoints: Array<IWaypointInfo> = [];
        for (const singleWaypoint of waypoints) {
            const name = singleWaypoint.name;
            const route = await this.FindSingleRoute(origin, destination, singleWaypoint);
            const positionAfterTime = this.FindPositionOnRouteInTime(route, time);
            const distance = this.CalculateStraightDistance(positionAfterTime, destination);
            const waypointInfo = {
                name,
                route,
                positionAfterTime,
                distance,
            };
            newWaypoints.push(waypointInfo);
        };
        newWaypoints.sort((prev, next) => {
            return prev.distance - next.distance;
        });
        const winner = newWaypoints[0];

        return {
            winner_name: "A",
            delays: {
                "A": 0,
            },
        };
    }

    private ConstructOSRMApiCall = (origin: ILocation, destination: ILocation, waypoint: IWaypoint) => {
        return `${this.routingEngineBaseUrl}/route/v1/driving/` +
            `${origin.lon},${origin.lat};` +
            `${waypoint.lon},${waypoint.lat};` +
            `${destination.lon},${destination.lat}` +
            `?geometries=geojson&annotations=duration&overview=full`;
    }

    private FindSingleRoute = async (origin: ILocation, destination: ILocation, waypoint: IWaypoint): Promise<IRoute> => {
        const apiUrl = this.ConstructOSRMApiCall(origin, destination, waypoint);
        let response;
        try {
            response = await axios.get(apiUrl);
            console.log(response.data.routes[0]);
            return response.data.routes[0];
        } catch (err) {
            console.log(err);
            throw new Error("Error while handling the request.");
        }
    }

    private FindPositionOnRouteInTime = (route: IRoute, time: number): ILocation => {
        return {
            lat: 0,
            lon: 0,
        };
    }

    // TODO: Placeholder, but will work most of the time
    private CalculateStraightDistance = (origin: ILocation, destination: ILocation) => {
        return Math.sqrt( (destination.lon - origin.lon) * (destination.lon - origin.lon) + (destination.lat - origin.lat) * (destination.lat - origin.lat) );
    }
}