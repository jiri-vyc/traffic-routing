export class HealthCheckService {
    public GetStatus = async (): Promise<object> => {
        return {
            server_status: "Up"
        };
    }
}