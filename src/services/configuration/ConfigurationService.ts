import { ConfigurationModel } from "../../models";

export class ConfigurationService {
    protected model: ConfigurationModel;
    public constructor() {
        this.model = new ConfigurationModel();
    }
    public GetGlobalPassword = async (): Promise<string> => {
        return this.model.GetPassword();
    }
}