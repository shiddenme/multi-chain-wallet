import {
    Table,
    Column,
    Model
} from 'sequelize-typescript';

@Table({
    timestamps: false,
    freezeTableName: true
})
export class Sipc_Wallet_Token extends Model<Sipc_Wallet_Token> { 
    @Column({
        type: 'varchar(64)',
        primaryKey: true
    })
    public wallet: string;

    @Column({
        type: 'varchar(64)',
        primaryKey: true
    })
    public contract: string;
    
}