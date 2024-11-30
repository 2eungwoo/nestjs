import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { CreateArticleDto } from '../dto/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) { }

  /*
    게시글과 댓글 조회(단방향 관계)
  */
  async findArticleWithComments(articleId: number) {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException();
    }

    // 2. 쿼리 빌더를 사용하여 댓글 조회
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.articleId = :articleId', { articleId })
      .getMany();

    // 3. 댓글을 article 객체에 추가
    article['comments'] = comments;

    return article;
  }

  /*
    게시글 생성
  */
  async createArticle(createArticleDto: CreateArticleDto, qr: QueryRunner) {
    const newArticle = await qr.manager.save(Article, {
      title: createArticleDto.title,
      content: createArticleDto.content
    })

    return newArticle;
    // const article = await this.articleRepository.create(createArticleDto);
    // return this.articleRepository.save(article);
  }
}
