import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ArticleService } from '../service/article.service';
import { CustomPublicDecorator } from 'src/auth/decorator/public.decorator';
import { CustomRBAC } from 'src/auth/decorator/rabc.decorator';
import { Role } from 'src/users/entities/user.entity';
import { TransactionInterceptor } from 'src/common/interceptor/transaction-interceptor';
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }

  @Post()
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

  @Get(':id')
  @CustomPublicDecorator()
  findOne(@Param('id', ParseIntPipe) articleId: number) {
    return this.articleService.findArticleWithComments(articleId);
  }
}
