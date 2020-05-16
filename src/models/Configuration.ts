export class ConfigurationModel {
    public GetPassword = async (): Promise<string> => {
        return "Mileus"; // TODO: Connect model to DB, now only mock
    }
}