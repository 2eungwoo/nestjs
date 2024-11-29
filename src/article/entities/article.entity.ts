import { Comment } from 'src/comment/entities/comment.entity';
import { BaseTable } from 'src/common/entity/base-table.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Article extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;

  //   @OneToMany(() => Comment, (comment) => comment.id, { cascade: true })
  //   comments: Comment[];
}
