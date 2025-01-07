'use strict';

import {QueryInterface} from 'sequelize';
import dotenv from "dotenv";
import path from "path";
import * as Sequelize from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const activitiesTableName = "Activities";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface) {
    console.log(`migration up starting: Activities migration. In env: ${process.env.NODE_ENV}`)
    try {
      await createActivitiesTable(queryInterface)

      console.log(`migration up done: Activities migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration up failure: Activities migration`);
    }
  },

  async down (queryInterface: QueryInterface) {
    console.log(`migration down starting: Activities migration`)
    try {
      await queryInterface.dropTable(activitiesTableName);
      console.log(`migration down done: Activities migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration down failure: Activities migration`);
    }
  }
};

const createActivitiesTable = async (queryInterface: QueryInterface) => {
  const createTableResult = await queryInterface.createTable(activitiesTableName, {
    id: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.STRING,
    },

    type:{
      type: Sequelize.STRING,
      allowNull: false
    },

    channel: {
      type: Sequelize.STRING,
      allowNull: false
    },

    user_id: {
      type: Sequelize.STRING
    },

    username: {
      type: Sequelize.STRING,
    },

    message: {
      type: Sequelize.STRING(65535)
    },

    reply:{
      type: Sequelize.STRING(65535)
    },

    timestamp: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    }
  });

  

}
