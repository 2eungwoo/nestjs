import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';
import { ArticleService } from '../service/article.service';
import { CustomPublicDecorator } from 'src/auth/decorator/public.decorator';
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @CustomPublicDecorator()
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req,
  ) {
    const newArticle =
      await this.articleService.createArticle(createArticleDto);
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
