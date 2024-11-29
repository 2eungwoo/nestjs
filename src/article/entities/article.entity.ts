import { BaseTable } from "src/common/entity/base-table.entity";
import { Column, PrimaryGeneratedColumn } from "typeorm";


export class Article extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;
}
