'use strict';

import {QueryInterface} from 'sequelize';
import dotenv from "dotenv";
import path from "path";
import * as Sequelize from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const artworksTableName = "Artworks";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface) {
    console.log(`migration up starting: Artworks migration. In env: ${process.env.NODE_ENV}`)
    try {
      await createArtworksTable(queryInterface)

      console.log(`migration up done: Artworks migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration up failure: Artworks migration`);
    }
  },

  async down (queryInterface: QueryInterface) {
    console.log(`migration down starting: Artworks migration`)
    try {
      await queryInterface.dropTable(artworksTableName);
      console.log(`migration down done: Artworks migration`)
    } catch (e) {
      console.error(e)
      throw new Error(`migration down failure: Artworks migration`);
    }
  }
};

const createArtworksTable = async (queryInterface: QueryInterface) => {
  const createTableResult = await queryInterface.createTable(artworksTableName, {
    file: {
      primaryKey: true,
      allowNull: false,
      type: Sequelize.STRING,
    },
    title:{
      type: Sequelize.STRING(255),
      allowNull: false
    },
    concept: {
      type: Sequelize.STRING(4096),
      allowNull: false
    },

    tags: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    post_id: {
      type: Sequelize.STRING
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
