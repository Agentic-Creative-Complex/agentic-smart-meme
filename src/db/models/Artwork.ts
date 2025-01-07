import { Column, CreatedAt, DataType, Default, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";

@Table({tableName: 'Artworks'})
  export class Artwork extends Model {
    @PrimaryKey
    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    file!: string;

    @Column({
      type: DataType.STRING,
      allowNull: false
    })
    title!: string;

    @Column({
      type: DataType.STRING(4096),
      allowNull: false
    })
    concept!: string;

    @Default([])
    @Column({
      type: DataType.ARRAY(DataType.STRING)
    })
    tags?: string[];

    @Column({
        type: DataType.STRING
      })
      post_id?: string;

      @CreatedAt
      @Column
      created_at!: Date;
    
      @UpdatedAt
      @Column
      updated_at!: Date;

  }