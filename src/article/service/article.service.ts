import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ArticleResponseDto } from '../dto/article.response.dto';
import { CommentResponseDto } from 'src/comment/dto/comment-response.dto';
import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';
import { CommonService } from 'src/common/Common.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    private readonly commonService: CommonService,
  ) { }

  /*
    게시글 단건 조회
  */
  async findArticleWithComments(articleId: number) {
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article) {
      throw new NotFoundException();
    }

    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.articleId = :articleId', { articleId })
      .getMany();

    // comment entity list -> dto list
    const commentsResponseDto = comments.map(comment => new CommentResponseDto(comment));

    // assign comment to article entity
    article['comments'] = comments;

    return { article, commentsResponseDto };
  }

  /*
    게시글 목록 조회 Page Based Pagination
  */
  async findAllArticles(paginationDto: PagePaginationDto, qr: QueryRunner) {

    const { page, take } = paginationDto;

    // 기본값 설정 (값이 없을 경우 기본값 사용)
    const pageNumber = page || 1;
    const pageSize = take || 20;

    // QueryBuilder 사용하여 게시글 목록 조회
    const qb = qr.manager
      .createQueryBuilder(Article, 'article')

    if (take && page) {
      this.commonService.applyPagePaginationParamsToQb(qb, paginationDto);
    }

    return qb.getManyAndCount();
  }

  /*
    게시글 생성
  */
  async createArticle(createArticleDto: CreateArticleDto, qr: QueryRunner) {
    const newArticle = await qr.manager.save(Article, {
      title: createArticleDto.title,
      content: createArticleDto.content
    })

    return new ArticleResponseDto(newArticle, []);
    // const article = await this.articleRepository.create(createArticleDto);
    // return this.articleRepository.save(article);
  }
}
