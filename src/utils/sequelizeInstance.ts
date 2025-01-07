/**
 * To use sequelize.query (and other methods) we need to get the sequelize instance that was configured for the app.
 * So we have added this helper to set/get the instance.
 */
import {Sequelize} from "sequelize";

let sequelize: Sequelize|null = null

export const sequelizeInstance = () : Sequelize => {
  if (sequelize === null) throw new Error("Sequelize not initialized")
  return sequelize
}

export const setSequelizeInstance = (sequelizeInstance: Sequelize) => {
  sequelize = sequelizeInstance
}
