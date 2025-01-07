'use strict';

import {QueryInterface} from 'sequelize';
import dotenv from "dotenv";
import path from "path";
import * as Sequelize from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const tgMessagesTableName = "TgMessages";
const tgChatsTableName = "TgChats";
const usersTableName = "Users";
const mentionsTableName = "Mentions";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface) {
    console.log(`migration up starting: initial migration. In env: ${process.env.NODE_ENV}`)
    try {
      await changeMentionsTable(queryInterface, Sequelize.STRING({length: 65535}))
      await changeUsersTable(queryInterface)
      await createMessagesTable(queryInterface)
      await createChatsTable(queryInterface)

      console.log(`migration up done: initial migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration up failure: initial migration`);
    }
  },

  async down (queryInterface: QueryInterface) {
    console.log(`migration down starting: initial migration`)
    try {
      await changeMentionsTable(queryInterface, Sequelize.STRING)
      await queryInterface.dropTable(tgMessagesTableName);
      await queryInterface.removeColumn(usersTableName, 'tg_id');
      await queryInterface.removeColumn(usersTableName, 'tg_username');
      await queryInterface.dropTable(tgChatsTableName);
      console.log(`migration down done: initial migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration down failure: initial migration`);
    }
  }
};

const changeMentionsTable = async (queryInterface: QueryInterface, type: Sequelize.DataType) => {
  const changeMessageResult = await queryInterface.changeColumn(mentionsTableName, 'message', {
    type: type
  });

  const changeReplyResult = await queryInterface.changeColumn(mentionsTableName, 'reply', {
    type: type
  });

}

const changeUsersTable = async (queryInterface: QueryInterface) => {

  const changeMessageResult = await queryInterface.addColumn(usersTableName, 'tg_id', {
    type: Sequelize.STRING,
    allowNull: true
  });

  const changeReplyResult = await queryInterface.addColumn(usersTableName, 'tg_username', {
    type: Sequelize.STRING,
    allowNull: true
  });

  await queryInterface.addIndex(usersTableName, ['tg_id'], {
    name: 'users_tg_id_index',
  });

  await queryInterface.addIndex(usersTableName, ['tg_username'], {
    name: 'users_tg_username_index',
  });

}


const createMessagesTable = async (queryInterface: QueryInterface) => {
  const createTableResult = await queryInterface.createTable(tgMessagesTableName, {

    update_id: {
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
    chat_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    message_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    user_tg_id: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    chat_name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    chat_type: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    message_text: {
      allowNull: false,
      type: Sequelize.STRING(65535),
    },
    message_type: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    bot_reply_text: {
      type: Sequelize.STRING(65535),
    },
    user_name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    user_handle: {
      allowNull: false,
      type: Sequelize.STRING,
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

  await queryInterface.addIndex(tgMessagesTableName, ['user_id'], {
    name: 'tgmessage_user_id_index',
  });

  await queryInterface.addIndex(tgMessagesTableName, ['user_handle'], {
    name: 'tgmessage_user_handle_index',
  });

  await queryInterface.addIndex(tgMessagesTableName, ['timestamp'], {
    name: 'tgmessage_timestamp_index',
  });

}

const createChatsTable = async (queryInterface: QueryInterface) => {
  const createTableResult = await queryInterface.createTable(tgChatsTableName, {

    chat_id: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.STRING,
    },
    enabled: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
    },
    join_date: {
      type: Sequelize.BIGINT,
      allowNull: false
    },
    leave_date: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    chat_name: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    chat_type: {
      allowNull: false,
      type: Sequelize.STRING,
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
