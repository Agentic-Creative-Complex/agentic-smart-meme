import { Column, CreatedAt, DataType, Default, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { User } from "./User";
import { TgMessageAttributes } from "../../types/TelegramTypes";
 

  @Table
  export class TgMessage extends Model<TgMessageAttributes> {
    @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    update_id!: string;

    @ForeignKey(() => User)
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    user_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
      })
    user_tg_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
      })
    chat_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
      })
    message_id!: string;

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

    @Default(() => '')
    @Column({
      type: DataType.STRING(65535),
      allowNull: true
    })
    message_text?: string;

    @Column({
        type: DataType.STRING(65535),
        allowNull: false
    })
    message_type!: string;

    @Column({
      type: DataType.STRING(65535)
    })
    bot_reply_text!: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    timestamp!: number;

    @Default(() => '')
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    user_name?: string;

    @Default(() => '')
    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    user_handle?: string;

    @CreatedAt
    @Column
    created_at!: Date;

    @UpdatedAt
    @Column
    updated_at!: Date;

  }