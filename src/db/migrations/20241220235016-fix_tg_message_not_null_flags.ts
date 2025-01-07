'use strict';

import {QueryInterface} from 'sequelize';
import dotenv from "dotenv";
import path from "path";
import * as Sequelize from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const tgMessagesTableName = "TgMessages";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface) {
    console.log(`migration up starting: fix message columns migration. In env: ${process.env.NODE_ENV}`)
    try {
      await queryInterface.changeColumn(tgMessagesTableName, 'message_text', {
        type: Sequelize.STRING({length: 65535}),
        allowNull: true
      });

      await queryInterface.changeColumn(tgMessagesTableName, 'user_name', {
        type: Sequelize.STRING,
        allowNull: true
      });

      await queryInterface.changeColumn(tgMessagesTableName, 'user_handle', {
        type: Sequelize.STRING,
        allowNull: true
      });
      

      console.log(`migration up done: fix message columns migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration up failure: fix message columns migration`);
    }
  },

  async down (queryInterface: QueryInterface) {
    console.log(`migration down starting: fix message columns migration`)
    try {
      await queryInterface.changeColumn(tgMessagesTableName, 'message_text', {
        type: Sequelize.STRING({length: 65535}),
        allowNull: false
      });

      await queryInterface.changeColumn(tgMessagesTableName, 'user_name', {
        type: Sequelize.STRING,
        allowNull: false
      });

      await queryInterface.changeColumn(tgMessagesTableName, 'user_handle', {
        type: Sequelize.STRING,
        allowNull: false
      });
      console.log(`migration down done: fix message columns migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration down failure: fix message columns migration`);
    }
  }
};
