import {
    Table,
    Column,
    Model,
    DataType
} from 'sequelize-typescript';


@Table({
    tableName: "block",
    timestamps: false,
    freezeTableName: true
})
export class Block extends Model<Block> {
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    })
    public number: number;

    @Column({
        type: 'varbinary(16)',
        allowNull: false
    })
    public difficulty: string;

    @Column({
        type: 'varbinary(5000)',
        allowNull: false
    })
    public extraData: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    public gasLimit: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    public gasUsed: number;

    @Column({ type: 'binary(128)' })
    public hash: string;
    
    @Column({ type: 'varbinary(1024)' })
    public logsBloom: string;

    @Column({ type: 'binary(64)' })
    public miner: string;

    @Column({ type: 'binary(128)' })
    public mixHash: string;

    @Column({ type: 'binary(32)' })
    public nonce: string;

    @Column({ type: 'binary(128)' })
    public parentHash: string;

    @Column({ type: 'binary(128)' })
    public receiptsRoot: string;

    @Column({ type: 'binary(128)' })
    public sha3Uncles: string;

    @Column({ type: DataType.SMALLINT })
    public unclesCount: string;

    @Column({ type: DataType.DOUBLE })
    public uncleInclusionRewards: number;

    @Column({ type: DataType.DOUBLE })
    public txnFees: number;

    @Column({ type: DataType.DOUBLE })
    public minerReward: number;

    @Column({ type: DataType.DOUBLE })
    public foundation: number;

    @Column({ type: DataType.MEDIUMINT })
    public size: number;

    @Column({ type: 'binary(128)' })
    public stateRoot: number;

    @Column({ type: DataType.INTEGER })
    public timestamp: number;

    @Column({ type: 'varbinary(20)' })
    public totalDifficulty: string;
    
    @Column({ type: 'binary(128)' })
    public transactionsRoot: number;



}

@Table({
    tableName: "block_1",
    timestamps: false,
    freezeTableName: true
})
export class Block1 extends Model<Block1> {
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true
    })
    public number: number;

    @Column({
        type: 'varbinary(16)',
        allowNull: false
    })
    public difficulty: string;

    @Column({
        type: 'varbinary(5000)',
        allowNull: false
    })
    public extraData: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    public gasLimit: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    public gasUsed: number;

    @Column({ type: 'binary(128)' })
    public hash: string;
    
    @Column({ type: 'varbinary(1024)' })
    public logsBloom: string;

    @Column({ type: 'binary(64)' })
    public miner: string;

    @Column({ type: 'binary(128)' })
    public mixHash: string;

    @Column({ type: 'binary(32)' })
    public nonce: string;

    @Column({ type: 'binary(128)' })
    public parentHash: string;

    @Column({ type: 'binary(128)' })
    public receiptsRoot: string;

    @Column({ type: 'binary(128)' })
    public sha3Uncles: string;

    @Column({ type: DataType.SMALLINT })
    public unclesCount: string;

    @Column({ type: DataType.DOUBLE })
    public uncleInclusionRewards: number;

    @Column({ type: DataType.DOUBLE })
    public txnFees: number;

    @Column({ type: DataType.DOUBLE })
    public minerReward: number;

    @Column({ type: DataType.DOUBLE })
    public foundation: number;

    @Column({ type: DataType.MEDIUMINT })
    public size: number;

    @Column({ type: 'binary(128)' })
    public stateRoot: number;

    @Column({ type: DataType.INTEGER })
    public timestamp: number;

    @Column({ type: 'varbinary(20)' })
    public totalDifficulty: string;
    
    @Column({ type: 'binary(128)' })
    public transactionsRoot: number;



}