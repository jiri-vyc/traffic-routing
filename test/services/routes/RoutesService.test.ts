import test from "ava";
import { RoutesService } from "../../../src/services";


test('FindBestAlternative', async t => {
    const res = new RoutesService().FindBestAlternative({lat: 0, lon: 0}, {lat: 0, lon: 0}, 180, []);
    t.deepEqual(await res, {
            winner_name: "A",
            delays: {
                "A": 0,
            },
        });
});