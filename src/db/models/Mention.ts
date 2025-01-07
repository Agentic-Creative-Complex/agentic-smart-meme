import { Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { User } from "./User";


@Table
  export class Mention extends Model {
    @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    user_id!: string;

    @Column({
      type: DataType.STRING(65535),
      allowNull: false
    })
    message!: string;

    @Column({
        type: DataType.STRING
    })
    reply_id!: string;

    @Column({
      type: DataType.STRING(65535)
    })
    reply!: string;

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