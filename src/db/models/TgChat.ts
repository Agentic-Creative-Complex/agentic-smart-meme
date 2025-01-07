import { Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
 
export interface TgChatAttributes{
    chat_id: string;
    enabled: boolean;
    join_date: number;
    leave_date?: number;
    chat_name: string;
    chat_type: string;
}

  @Table
  export class TgChat extends Model<TgChatAttributes> {
    @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    chat_id!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false
    })
    enabled!: boolean;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    join_date!: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: true
    })
    leave_date?: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
      })
    chat_name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
      })
    chat_type!: string;

    @CreatedAt
    @Column
    created_at!: Date;

    @UpdatedAt
    @Column
    updated_at!: Date;

  }