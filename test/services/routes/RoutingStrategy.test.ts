import test from "ava";
import { OSRMCarRoutingStrategy, FlightRoutingStrategy } from "../../../src/services/routes/RoutingStrategy";
import { testWaypoints, testResultRoutes } from "./testData";


test('FlightRoutingStrategy.GetDistance', async t => {
    const res = await new FlightRoutingStrategy().GetDistance({lat: 55, lon: 48}, {lat: 105, lon: 13});
    t.truthy(res >= 61.03 && res <= 61.04);
});

test('OSRMCarRoutingStrategy.FindSingleRoute', async t => {
    const res = new OSRMCarRoutingStrategy().FindSingleRoute(testWaypoints.berlin, testWaypoints.munchen, testWaypoints.frankfurt);
    t.deepEqual(await res, testResultRoutes.berlin_frankfurt_munchen);
});