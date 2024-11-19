import { Reflector } from '@nestjs/core';

// Reflector.createDecorator : 데코레이터를 만드는 함수.
// Reflector.createDecorator<type> 이렇게 해서 데코레이터 파라미터 타입 지정 가능
export const CustomPublicDecorator = Reflector.createDecorator();
