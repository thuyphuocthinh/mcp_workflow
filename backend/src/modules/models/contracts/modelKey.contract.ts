export class ModelKeyContract {
    id: string;
    key: string;
    modelType: string;

    constructor(id: string, key: string, modelType: string) {
        this.id = id;
        this.key = key;
        this.modelType = modelType;
    }
}