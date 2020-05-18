import test from "ava";
import { RoutesService } from "../../../src/services";

const testWaypoints = {
    norimberk: {
        name: "Norimberk",
        lon: 11.074755,
        lat: 49.420057,
    },
    mnichov: {
        name: "Mnichov",
        lon: 11.533705,
        lat: 48.209821,
    },
    berlin: {
        name: "Berlin",
        lon: 13.287470,
        lat: 52.501316,
    },
    frankfurt: {
        name: "Frankfurt",
        lon: 8.702701,
        lat: 50.228169,
    },
    ostrava: {
        name: "Ostrava",
        lon: 18.239903,
        lat: 49.802349,
    }
}

test('FindBestAlternative', async t => {
    // From Berlin to Munchen, either through Frankfurt or Ostrava, in 2 hours check the car's position
    const res = new RoutesService().FindBestAlternative(testWaypoints.berlin, testWaypoints.mnichov, 7200, [testWaypoints.frankfurt, testWaypoints.ostrava]);
    t.deepEqual(await res, {
            winner_name: "Frankfurt",
            delays: {
                "Frankfurt": 0,
                "Ostrava": 0
            },
        });
    const res2 = new RoutesService().FindBestAlternative(testWaypoints.frankfurt, testWaypoints.norimberk, 7200, [testWaypoints.berlin, testWaypoints.mnichov]);
    t.deepEqual(await res2, {
            winner_name: "Mnichov",
            delays: {
                "Berlin": 0,
                "Mnichov": 0
            },
        });
    const res3 = new RoutesService().FindBestAlternative(testWaypoints.norimberk, testWaypoints.berlin, 7200, [testWaypoints.ostrava, testWaypoints.mnichov]);
        t.deepEqual(await res3, {
                winner_name: "Ostrava",
                delays: {
                    "Ostrava": 0,
                    "Mnichov": 0
                },
            });
    const res4 = new RoutesService().FindBestAlternative(testWaypoints.norimberk, testWaypoints.berlin, 14400, [testWaypoints.ostrava, testWaypoints.mnichov]);
        t.deepEqual(await res4, {
                winner_name: "Mnichov",
                delays: {
                    "Ostrava": 0,
                    "Mnichov": 0
                },
            });
});