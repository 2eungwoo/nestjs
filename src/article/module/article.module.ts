import { Module } from '@nestjs/common';
import { Article } from '../entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from '../controller/article.controller';
import { ArticleService } from '../service/article.service';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/entities/comment.entity';
import { CommonService } from 'src/common/Common.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Comment]), CommentModule, CommonModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule { }
