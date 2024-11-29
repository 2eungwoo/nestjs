import { Article } from "src/article/entities/article.entity";
import { BaseTable } from "src/common/entity/base-table.entity";
import { Column, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export class Comment extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => Article, (article) => article.id)
    @JoinTable()
    articles: Article[];
}
