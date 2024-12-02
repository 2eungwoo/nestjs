import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const QueryRunnerDecorator = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();

        if (!request || !request.queryRunner) {
            throw new InternalServerErrorException('쿼리 러너 객체를 찾을 수 없음');
        }

        return request.queryRunner;
    }
)