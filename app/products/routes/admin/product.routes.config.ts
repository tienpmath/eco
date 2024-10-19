import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { ProductController } from '../../controller/admin/product.controller';
import { ProductMiddleWare } from '../../midleware/admin/product.midlware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class ProductValuesRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ProductRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const productController = new ProductController();
    const authMiddleWare = new AuthMiddleWare();
    const productMiddleWare = new ProductMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/products', [productMiddleWare.validateProductFields,disableAddDelete.validateAuthorization, adminMiddleWare.validateAdminUser, productController.createProduct]);
    this.app.put('/products/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, productController.updateProductById]);
    this.app.post('/allproducts', [productController.getAllProduct]);
    this.app.get('/products/:id', [authMiddleWare.validateAuthorization, productController.getProductById]);
    this.app.delete('/products/:ids', [adminMiddleWare.validateAdminUser, disableAddDelete.validateAuthorization,productController.deleteProductById]);
  }
}
