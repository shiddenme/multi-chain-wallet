import { Table, Column, Model } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class Sipc_Asset extends Model<Sipc_Asset> {
  @Column({
    type: 'varchar(64)',
    primaryKey: true,
  })
  public wallet: string;

  @Column({
    type: 'varchar(64)',
    primaryKey: true,
  })
  public contract: string;
}
