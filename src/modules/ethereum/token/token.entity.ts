import {
    Table,
    Column,
    Model
} from 'sequelize-typescript';

@Table({
    timestamps: false,
    freezeTableName: true
})
export class Eth_Token extends Model<Eth_Token> { 
    @Column({
        type: 'varchar(64)',
        primaryKey: true
    })
    public contract: string;

    @Column({
        type: 'varchar(64)'
    })
    public token: string;
    
    @Column({
        type: 'varchar(512)'
    })
    public icon : string;
}