ErrorHandling should be improved upon (single error handling function, error codes, global Error interface, difference between operational/non-operational errors)

API should be RESTful. POSTing a payload just as parameters to GET some result is wrong. Either fully commit to this and use GraphQL or something, or re-design API to `GET /best-alternative`

The results can be slightly not precise - 1 index off (1 more record in geometry than durations annotations, didn't have the time to check which way) - should be easy to fix

What if the routes are identical up until certain point = the result is then chosen by random (the first is taken), should not be against specs

Naive implementation: what can be improved:
- make the requests in parallel, promise.all after getting all route data from OSRM
- then promise.all on calculating position after time and distance
- save only the distances to an array, then choose Min more efficiently than sort()
- then calculate delays in parallel

TODO:
- implement delays
- add API docs (swagger, apiary)
- add more Unit tests, add API tests (controllers, middleware - e.g. `supertest`)
- add TSlint
- improve error handling
