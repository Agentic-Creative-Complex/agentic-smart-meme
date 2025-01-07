'use strict';

import {QueryInterface} from 'sequelize';
import dotenv from "dotenv";
import path from "path";
import * as Sequelize from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const mentionsTableName = "Mentions";
const usersTableName = "Users"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface) {
    console.log(`migration up starting: initial migration. In env: ${process.env.NODE_ENV}`)
    try {

      await createUsersTable(queryInterface)
      await createMentionsTable(queryInterface)

      console.log(`migration up done: initial migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration up failure: initial migration`);
    }
  },

  async down (queryInterface: QueryInterface) {
    console.log(`migration down starting: initial migration`)
    try {
      await queryInterface.dropTable(mentionsTableName);
      await queryInterface.dropTable(usersTableName);
      console.log(`migration down done: initial migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration down failure: initial migration`);
    }
  }
};

const createUsersTable = async (queryInterface: QueryInterface) => {
  const createTableResult = await queryInterface.createTable(usersTableName, {
    id: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.STRING,
    },
    username: {
      type: Sequelize.STRING({length: 20}),
    },    
    thread_id: {
      type: Sequelize.STRING,
    },
    wallet_addresses: {
      type: Sequelize.ARRAY(Sequelize.STRING)
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

  await queryInterface.addIndex(usersTableName, ['username'], {
    name: 'username_index',
  });

  await queryInterface.addIndex(usersTableName, ['wallet_addresses'], {
    name: 'wallet_addresses_index',
  });

  console.log(createTableResult)

}


const createMentionsTable = async (queryInterface: QueryInterface) => {
  const createTableResult = await queryInterface.createTable(mentionsTableName, {
    id: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.STRING,
    },
    user_id: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: usersTableName,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    message: {
      allowNull: false,
      type: Sequelize.STRING(16000),
    },
    reply_id: {
      type: Sequelize.STRING,
    },
    reply: {
      type: Sequelize.STRING(16000),
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

  console.log(createTableResult)

  await queryInterface.addIndex(mentionsTableName, ['user_id'], {
    name: 'user_id_index',
  });

  await queryInterface.addIndex(mentionsTableName, ['timestamp'], {
    name: 'timestamp_index',
  });

}
