import { Table, Column, Model } from 'sequelize-typescript';

@Table({
  timestamps: false,
  freezeTableName: true,
})
export class Eth_Asset extends Model<Eth_Asset> {
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
