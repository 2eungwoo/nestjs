import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UnauthorizedFilter } from "src/common/filter/unauthorized.filter";

export const UserId = createParamDecorator(
    (data: unknown/* 데코레이터 안에 들어오는 파라미터 */, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();

        if (!request || !request.user || !request.user.sub) {
            throw new UnauthorizedFilter();
        }

        return request.user.sub;
    }
);