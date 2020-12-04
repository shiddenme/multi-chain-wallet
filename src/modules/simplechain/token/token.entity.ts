import {
    Table,
    Column,
    Model,
    DataType
} from 'sequelize-typescript';

@Table({
    timestamps: false,
    freezeTableName: true
})
export class Sipc_Token extends Model<Sipc_Token> { 
    @Column({
        type: 'varchar(64)',
        primaryKey: true
    })
    public contract: string;

    @Column({
        type: 'varchar(64)'
    })
    public symbol: string;
    
    @Column({
        type: 'varchar(512)'
    })
    public icon: string;

    @Column({
        type: 'varchar(64)'
    })
    public name: string;
    
    @Column({
        type: DataType.INTEGER
    })
    public sort: number;

}