import { Module } from '@nestjs/common';
import { Article } from '../entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from '../controller/article.controller';
import { ArticleService } from '../service/article.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule { }
