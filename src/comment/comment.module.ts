import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/article/entities/article.entity';
import { Comment } from './entities/comment.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Article]),
    CommonModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule { }
