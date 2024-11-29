import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { Article } from 'src/article/entities/article.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  /**
   * 댓글 생성
   */
  async create(createCommentDto: CreateCommentDto) {
    const article = await this.articleRepository.findOne({
      where: { id: createCommentDto.articleId },
    });

    const newComment = await this.commentRepository.create(createCommentDto);

    newComment.assignArticle(article);

    return this.commentRepository.save(newComment);
  }
}
