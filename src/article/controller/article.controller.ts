import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  ParseIntPipe,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ArticleService } from '../service/article.service';
import { CustomPublicDecorator } from 'src/auth/decorator/public.decorator';
import { CustomRBAC } from 'src/auth/decorator/rabc.decorator';
import { Role } from 'src/users/entities/user.entity';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
import { CommonService } from 'src/common/Common.service';
import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';
import { ArticleResponseDto } from '../dto/article.response.dto';
@Controller()
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly commonService: CommonService,
  ) { }

  @Post('/articles')
  @CustomRBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req,
  ) {
    const newArticle =
      await this.articleService.createArticle(createArticleDto, req);
    return { newArticle, user: req.user, params: req.params, body: req.body };
  }

  // @Get()
  // @CustomPublicDecorator()
  // findAll() {
  //   return this.articleService.findAll();
  // }

  @Get('/articles/:id')
  @CustomPublicDecorator()
  async findOne(@Param('id', ParseIntPipe) articleId: number) {
    const { article, commentsResponseDto } = await this.articleService.findArticleWithComments(articleId);
    return new ArticleResponseDto(article, commentsResponseDto);
  }

  @Get('/articles/all')
  @CustomPublicDecorator()
  @UseInterceptors(TransactionInterceptor)
  async findAllArticles(@Query() paginationDto: PagePaginationDto, @Request() req) {
    const [articleList, totalCount] = await this.articleService.findAllArticles(paginationDto, req);
    const articleListResponseDto = articleList.map((article) => new ArticleResponseDto(article));

    // 페이지네이션 정보와 함께 반환
    return {
      data: articleListResponseDto,
      totalCount,
    };
  };

}
