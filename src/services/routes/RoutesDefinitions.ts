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
    if (!body || !body.length) {
        return false;
    }
    for (const singleWaypoint of body) {
        if (!isWaypoint(singleWaypoint)) {
            return false;
        }
    }
    return true;
}
