import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../services/routes/common.router.config';
import { SharedController } from './controllers/shared.controller';
import FileMiddleware from '../commons/fileupload.middleware';

export class SharedRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'shared route');
    this.configureRoutes();
  }
  configureRoutes() {
    const sharedController = new SharedController();
    this.app.post('/images', [FileMiddleware.diskLoader.single('image'), sharedController.postImage]);
    this.app.get('/images/:url', [sharedController.getImage]);
    this.app.delete('/images/:url', [sharedController.deletImage]);
    this.app.post('/home/currenyIcon', [sharedController.currenyIcon]);
  }
}
