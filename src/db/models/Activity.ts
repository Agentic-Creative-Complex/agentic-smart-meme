import { Column, CreatedAt, DataType, Default, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";

export enum ActivityType {
  INTERACTION = 'INTERACTION',
  THOUGHT_PROCESS = 'THOUGHT_PROCESS',
  CREATION_PROCESS = 'CREATION_PROCESS',
  NEW_USER = 'NEW_USER',
}

export enum ActivityChannel {
  TELEGRAM = 'TELEGRAM',
  X = 'X',
  TERMINAL = 'TERMINAL',
  CORE = 'CORE',
}

@Table({tableName: 'Activities'})
  export class Activity extends Model {
    @Default(()=> String(Date.now()))
    @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    id!: string;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    type!: ActivityType;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    channel!: ActivityChannel;

    @Column({
      type: DataType.STRING
    })
    user_id?: string;

    @Column({
      type: DataType.STRING,
    })
    username?: string;

    @Column({
      type: DataType.STRING(65535)
    })
    message?: string;

    @Column({
      type: DataType.STRING(65535)
    })
    reply?: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
      })
      timestamp!: number;

      @CreatedAt
      @Column
      created_at!: Date;
    
      @UpdatedAt
      @Column
      updated_at!: Date;

  }