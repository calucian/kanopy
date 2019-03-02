const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

class SequelizeService
{
    constructor (modelPath, database, username, password, config) {
        this.sequelize = new Sequelize(database, username, password, config);
        this.models = {};

        fs
            .readdirSync(modelPath)
            .forEach(file => {
                let model = this.sequelize.import(path.join(modelPath, file));
                this.models[model.name] = model
            });

        Object.keys(this.models).forEach(modelName => {
            if (this.models[modelName].associate) {
                this.models[modelName].associate(this.models)
            }
        });
    }

    getModel (model) {
        if (!this.models[model]) {
            throw new Error("Unknown model " + model);
        }

        return this.models[model];
    }
}

module.exports = SequelizeService;