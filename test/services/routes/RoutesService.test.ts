import test from "ava";
import { RoutesService } from "../../../src/services";
import { testWaypoints } from "./testData";

test('FindBestAlternative', async t => {
    // From Berlin to Munchen, either through Frankfurt or Ostrava, in 2 hours check the car's position
    const res = new RoutesService().FindBestAlternative(testWaypoints.berlin, testWaypoints.munchen, 7200, [testWaypoints.frankfurt, testWaypoints.ostrava]);
    t.deepEqual(await res, {
            winner_name: "Frankfurt",
            delays: {
                "Frankfurt": 0,
                "Ostrava": 0
            },
        });
    const res2 = new RoutesService().FindBestAlternative(testWaypoints.frankfurt, testWaypoints.norimberk, 7200, [testWaypoints.berlin, testWaypoints.munchen]);
    t.deepEqual(await res2, {
            winner_name: "Munchen",
            delays: {
                "Berlin": 0,
                "Munchen": 0
            },
        });
    const res3 = new RoutesService().FindBestAlternative(testWaypoints.norimberk, testWaypoints.berlin, 7200, [testWaypoints.ostrava, testWaypoints.munchen]);
        t.deepEqual(await res3, {
                winner_name: "Ostrava",
                delays: {
                    "Ostrava": 0,
                    "Munchen": 0
                },
            });
    const res4 = new RoutesService().FindBestAlternative(testWaypoints.norimberk, testWaypoints.berlin, 14400, [testWaypoints.ostrava, testWaypoints.munchen]);
        t.deepEqual(await res4, {
                winner_name: "Munchen",
                delays: {
                    "Ostrava": 0,
                    "Munchen": 0
                },
            });
    const res5 = new RoutesService().FindBestAlternative(testWaypoints.berlin, testWaypoints.munchen, 14400, [testWaypoints.frankfurt, testWaypoints.ostrava, testWaypoints.norimberk ]);
        t.deepEqual(await res5, {
                winner_name: "Norimberk",
                delays: {
                    "Ostrava": 0,
                    "Norimberk": 0,
                    "Frankfurt": 0
                },
            });
});