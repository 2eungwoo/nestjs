import { Expose } from "class-transformer";
import { Article } from "src/article/entities/article.entity";
import { Comment } from "../entities/comment.entity";

export class CommentResponseDto {
    @Expose() id: number;
    @Expose() articleId: number;
    @Expose() content: string;
    @Expose() createdAt: Date;
    @Expose() updatedAt: Date;


    constructor(comment: Comment) {
        this.id = comment.id;
        this.articleId = comment.article.id;
        this.content = comment.content;
        this.createdAt = comment.createdAt;
        this.updatedAt = comment.updatedAt;
    }

}