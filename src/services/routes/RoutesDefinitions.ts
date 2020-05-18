export interface ILocation {
    lat: number;
    lon: number;
}

export interface IWaypoint extends ILocation {
    name: string;
}

export interface IWinnerWithDelaysResponse {
    winner_name: string;
    delays: {
        [key: string]: number,
    };
}

export interface IRoute {
    geometry: IGeometry;
    legs: Array<IRouteLeg>;
    duration: number;
    distance: number;
}

export interface IGeometry {
    coordinates: Array<Array<number>>;
    type: string;
}

export interface IRouteLeg {
    annotation: IAnnotation;
    duration: number;
    distance: number;
}

export interface IAnnotation {
    duration: Array<number>;
}

export interface IWaypointInfo {
    name: string;
    route: IRoute;
    positionAfterTime: ILocation;
    distance: number;
}

/**
 * TypeGuard for type Location
 */
export const isLocation = (body: any | ILocation): body is ILocation => {
    return (body as ILocation).lat !== undefined &&
        (body as ILocation).lon !== undefined && 
        !isNaN((body as ILocation).lat) &&
        !isNaN((body as ILocation).lon);
}

/**
 * TypeGuard for type Waipoint
 */
export const isWaypoint = (body: any | IWaypoint): body is IWaypoint => {
    return (body as IWaypoint).name !== undefined &&
        (body as IWaypoint).lat !== undefined &&
        (body as IWaypoint).lon !== undefined &&
        !isNaN((body as IWaypoint).lat) &&
        !isNaN((body as IWaypoint).lon);
}

/**
 * Check for whole array if it consists solely of Waypoints
 */
export const isWaypointsArray = (body: any | Array<IWaypoint>) => {
    if (!Array.isArray(body)) {
        return false;
    }
    for (const singleWaypoint of body) {
        if (!isWaypoint(singleWaypoint)) {
            return false;
        }
    }
    return true;
}
