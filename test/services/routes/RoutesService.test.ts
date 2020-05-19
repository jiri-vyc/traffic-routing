import test from "ava";
import { RoutesService } from "../../../src/services";
import { testWaypoints } from "./testData";

test('FindBestAlternative', async t => {
    // From Berlin to Munchen, either through Frankfurt or Ostrava, in 2 hours check the car's position
    const res = await new RoutesService().FindBestAlternative(testWaypoints.berlin, testWaypoints.munchen, 7200, [testWaypoints.frankfurt, testWaypoints.ostrava]);
    t.is(res.winner_name, "Frankfurt");
    t.is(res.delays["Frankfurt"], 0);
    t.truthy(res.delays["Ostrava"] > 0);

    const res2 = await new RoutesService().FindBestAlternative(testWaypoints.frankfurt, testWaypoints.norimberk, 7200, [testWaypoints.berlin, testWaypoints.munchen]);
    t.is(res2.winner_name, "Munchen");
    t.is(res2.delays["Munchen"], 0);
    t.truthy(res2.delays["Berlin"] > 0);

    // http://router.project-osrm.org/route/v1/driving/11.074755,49.420057;18.239903,49.802349;13.287470,52.501316?geometries=geojson&annotations=duration&overview=full
    // http://router.project-osrm.org/route/v1/driving/11.074755,49.420057;11.533705,48.209821;13.287470,52.501316?geometries=geojson&annotations=duration&overview=full
    const res3 = await new RoutesService().FindBestAlternative(testWaypoints.norimberk, testWaypoints.berlin, 7200, [testWaypoints.ostrava, testWaypoints.munchen]);
    t.is(res3.winner_name, "Ostrava");
    t.is(res3.delays["Ostrava"], 0);
    t.truthy(res3.delays["Munchen"] > 0);

    const res4 = await new RoutesService().FindBestAlternative(testWaypoints.norimberk, testWaypoints.berlin, 14400, [testWaypoints.ostrava, testWaypoints.munchen]);
    t.is(res4.winner_name, "Munchen");
    t.is(res4.delays["Munchen"], 0);
    t.truthy(res4.delays["Ostrava"] > 0);

    const res5 = await new RoutesService().FindBestAlternative(testWaypoints.berlin, testWaypoints.munchen, 14400, [testWaypoints.frankfurt, testWaypoints.ostrava, testWaypoints.norimberk ]);
    t.is(res5.winner_name, "Norimberk");
    t.is(res5.delays["Norimberk"], 0);
    t.truthy(res5.delays["Frankfurt"] > 0);
    t.truthy(res5.delays["Ostrava"] > 0);
});