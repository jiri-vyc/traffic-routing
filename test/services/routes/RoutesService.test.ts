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
    const res = new RoutesService().FindBestAlternative(testWaypoints.berlin, testWaypoints.mnichov, 180, [testWaypoints.frankfurt, testWaypoints.ostrava]);
    t.deepEqual(await res, {
            winner_name: "Frankfurt",
            delays: {
                "A": 0,
            },
        });
});