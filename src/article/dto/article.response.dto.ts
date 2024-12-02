import { Expose } from "class-transformer";
import { Article } from "../entities/article.entity";
import { CommentResponseDto } from "src/comment/dto/comment-response.dto";
import { PagePaginationDto } from "src/common/dto/page-pagination.dto";

export class ArticleResponseDto {

    @Expose() id: number;
    @Expose() title: string;
    @Expose() content: string;
    @Expose() createdAt: Date;
    @Expose() updatedAt: Date;
    @Expose() comments: CommentResponseDto[];
    @Expose() page: number;
    @Expose() size: number;

    constructor(article: Article, comments?: CommentResponseDto[], pagination?: PagePaginationDto) {
        if (article) {
            this.id = article.id;
            this.title = article.title;
            this.content = article.content;
            this.createdAt = article.createdAt;
            this.updatedAt = article.updatedAt;
        }
        if (comments) {
            this.comments = comments;
        }
        if (pagination) {
            this.page = pagination.page;
            this.size = pagination.take;
        }
    }
}
