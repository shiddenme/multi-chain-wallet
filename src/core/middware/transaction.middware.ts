import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class transactionMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    console.log('Request...', req.query);
    next();
  }
}
