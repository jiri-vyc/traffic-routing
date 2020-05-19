import { IRoute, IWaypoint, ILocation } from "./RoutesDefinitions";
import { log } from "../../helpers";
const axios = require('axios').default;

export abstract class RoutingStrategy {
    public static ROUTE_NOT_FOUND_ERROR_MESSAGE = "route_not_found";
    /**
     * Finds a single route between point A and point B with one waypoint in between
     */
    public abstract async FindSingleRoute(origin: ILocation, destination: ILocation, waypoint: IWaypoint, full?: boolean): Promise<IRoute>;
    public abstract async FindPositionOnRouteInTime(route: IRoute, targetTime: number): Promise<ILocation>;
    public abstract async GetDistance(origin: ILocation, destination: ILocation): Promise<number>;
}

export class OSRMCarRoutingStrategy extends RoutingStrategy {

    private routingEngineBaseUrl = "http://router.project-osrm.org";

    /**
     * Construct the correct URL for the routing service based on parameters
     */
    private ConstructOSRMApiCall = (origin: ILocation, destination: ILocation, waypoint?: IWaypoint | null, full: boolean = true) => {
        return `${this.routingEngineBaseUrl}/route/v1/driving/` +
            `${origin.lon},${origin.lat};` +
            ( waypoint ? `${waypoint.lon},${waypoint.lat};` : ``) +
            `${destination.lon},${destination.lat}` +
            `?geometries=geojson` + 
            ( full ? `&annotations=duration&overview=full` : `` );
    }

    public FindSingleRoute = async (origin: ILocation, destination: ILocation, waypoint: IWaypoint | null, full: boolean = true): Promise<IRoute> => {
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

    public FindPositionOnRouteInTime = async (route: IRoute, targetTime: number): Promise<ILocation> => {
        let currentTime = 0;
        let i = 0;
        let allDurations: Array<number> = [];
        // Get all segments durations
        for (const duration of route.legs) {
            allDurations = allDurations.concat(duration.annotation.duration);
        }
        // Find index where sum of all durations so far reaches target ride time
        while (i < allDurations.length && currentTime < targetTime){
            currentTime += allDurations[i];
            i++;
        }
        // Position in target time is location of segment on the same index
        const result = {
            lat: route.geometry.coordinates[i][1],
            lon: route.geometry.coordinates[i][0],
        };
        log.debug(`After time ${targetTime} the car is at position ${result.lat},${result.lon}`);
        return result;
    }

    public GetDistance = async (origin: ILocation, destination: ILocation) => {
        return (await this.FindSingleRoute(origin, destination, null, false)).distance;
    }

}

export class FlightRoutingStrategy extends RoutingStrategy {
    // TODO: implement
    public FindSingleRoute = async (origin: ILocation, destination: ILocation, waypoint: IWaypoint, full: boolean = true): Promise<IRoute> => {
        throw new Error("This routing strategy doesn't support returning full route (yet).");
    }

    // TODO: implement, interpolate between A and B
    public FindPositionOnRouteInTime = async (route: IRoute, targetTime: number): Promise<ILocation> => {
        throw new Error("This routing strategy doesn't support returning position on route (yet).");
    }

    // TODO: Placeholder, but will work most of the time, simple point distance on 2d plane
    public GetDistance = async (origin: ILocation, destination: ILocation) => {
        const result = Math.sqrt( (destination.lon - origin.lon) * (destination.lon - origin.lon) + (destination.lat - origin.lat) * (destination.lat - origin.lat) );
        return result;
    }

}