import {
    Table,
    Column,
    Model,
    PrimaryKey,
    CreatedAt,
    UpdatedAt,
    DataType,
    HasMany,
    Default
  } from 'sequelize-typescript';

import { Mention } from './Mention';
  
  export type UserAttributes = {
    id: String,
    username: String,
    thread_id: String,
    mentions: [Mention],
    tg_id?: string;
    tg_username?: string;
    timestamp: string;
    created_at?: Date;
    updated_at?: Date;
  }
  
  @Table
  export class User extends Model {
  
    @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    id!: string;
  
    @Column({
      type: DataType.STRING({length: 20})
    })
    username!: string;
  
    @Column({
      type: DataType.STRING
    })
    thread_id!: string;

    @Default([])
    @Column({
        type: DataType.ARRAY(DataType.STRING)
    })
    wallet_addresses!: string[];
  
    @CreatedAt
    @Column
    created_at!: Date;
  
    @UpdatedAt
    @Column
    updated_at!: Date;

    @Column({
      type: DataType.STRING
    })
    tg_id!: string;
  
    @Column({
      type: DataType.STRING
    })
    tg_username!: string;
  
    @HasMany(() => Mention)
    mentions!: Mention[];
  
  }
  