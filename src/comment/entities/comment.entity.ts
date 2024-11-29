import { Article } from 'src/article/entities/article.entity';
import { BaseTable } from 'src/common/entity/base-table.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => Article, { nullable: true })
  @JoinColumn()
  article: Article;

  public assignArticle(article: Article) {
    this.article = article;
  }
}
