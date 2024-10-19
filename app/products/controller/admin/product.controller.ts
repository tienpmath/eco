/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Product from '../../models/product.model';
import { dateFormate } from '../../../commons/constants';
import { NodeLocalCache } from '../../../commons/node.cache';
import { logger } from '../../../commons/logger.middleware';
const { ObjectId } = require('mongodb');

export class ProductController {
  constructor() {}
  async createProduct(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const variants = [];
    for (let i = 0; i < req.body.variants.length; i++) {
      const vId = new ObjectId();
      req.body.variants[i].attributes.forEach((atr: any) => {
        atr.values = [];
      });
      variants.push({
        int_glCode: vId.toString(),
        attributes: req.body.variants[i].attributes,
        price: req.body.variants[i].price,
        selling_price: req.body.variants[i].selling_price,
        stock: req.body.variants[i].stock,
        image: req.body.variants[i].image,
      });
    }
    req.body.variants = variants;
    const product = new Product({
      _id: cId,
      int_glcode: cId.toString(),
      dt_createddate: cDate,
      dt_modifydate: cDate,
      var_image: req.body.var_image,
      chr_publish: true,
      chr_delete: false,
      var_slug: req.body.var_title.toString().replaceAll(' ', '-'),
      ...req.body,
    });
    try {
      product
        .save()
        .then(async () => {
          NodeLocalCache.getInstance();
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Product created' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateProductById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const variants = [];
    if (req.body.variants) {
      for (let i = 0; i < req.body.variants.length; i++) {
        const vId = new ObjectId();
        req.body.variants[i].attributes.forEach((atr: any) => {
          atr.values = [];
        });
        variants.push({
          int_glCode: vId.toString(),
          attributes: req.body.variants[i].attributes,
          price: req.body.variants[i].price,
          selling_price: req.body.variants[i].selling_price,
          stock: req.body.variants[i].stock,
          image: req.body.variants[i].image,
        });
      }
      req.body.variants = variants;
    }
    const product = {
      updated_date: cDate,
      ...req.body,
    };

    try {
      Product.updateOne(
        { int_glcode: req.params.id },
        { $set: product },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(() => {
          NodeLocalCache.getInstance();
          const cache = NodeLocalCache.getCache()
          cache.flushAll();
          cache.getStats();
          res.status(200).send({ message: 'Product updated' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: e });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteProductById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await Product.findOneAndDelete({ _id: ids[i] });
      }
      NodeLocalCache.getInstance();
      const cache = NodeLocalCache.getCache()
      cache.flushAll();
      cache.getStats();
      res.status(200).send({ message: 'Product deleted' });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllProduct(req: Request, res: Response) {
    let limit = 100;
    let page = 0;
    let sort = {};
    const filter: any[] = [];
    if (req.body.fk_category) {
      filter.push({ fk_category: req.body.fk_category });
    }
    if (req.body.search) {
      filter.push({$or:[ {var_title: { $regex: req.body.search, $options: 'i' }}, {"category.var_title": { $regex: req.body.search, $options: 'i' }}, {"brand.var_title": { $regex: req.body.search, $options: 'i' }} ]});
    }
    if (req.body.fk_subcategory) {
      filter.push({ fk_subcategory: req.body.fk_subcategory });
    }
    if (req.body.fk_subcategory2) {
      filter.push({ fk_subcategory2: req.body.fk_subcategory2 });
    }
    if (req.body.fk_brand) {
      filter.push({ fk_brand: req.body.fk_brand });
    }
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
    if (req.body.sort) {
      sort = req.body.sort;
    }
    try {
      Product.aggregate([
       
        
        {
          $lookup: {
            from: 'categories',
            as: 'category',
            let: { int_glcode: '$fk_category' },
            pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
          },
        },
        {
          $lookup: {
            from: 'brands',
            as: 'brand',
            let: { int_glcode: '$fk_brand' },
            pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
          },
        },
        {
          $match:
            filter.length > 0
              ? {
                  $and: filter,
                }
              : {},
        },
        { $sort: sort },
        { $limit: limit + page },
        { $skip: page },
      ])

        .then((products: any) => {
          Product.aggregate([
       
        
            {
              $lookup: {
                from: 'categories',
                as: 'category',
                let: { int_glcode: '$fk_category' },
                pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
              },
            },
            {
              $lookup: {
                from: 'brands',
                as: 'brand',
                let: { int_glcode: '$fk_brand' },
                pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
              },
            },
            {
              $match:
                filter.length > 0
                  ? {
                      $and: filter,
                    }
                  : {},
            }
            
          ]).then((count: any) => {
            console.log(count);
            res.status(200).send({ data: products, total: count.length });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Product not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getProductById(req: Request, res: Response) {
    try {
      Product.findOne({ _id: req.params.id })
        .then((product: any) => {
          Product.findOneAndUpdate(
            { int_glcode: req.params.id },
            { $inc: { view_count: 1 } },
            {
              new: true,
              upsert: true,
            },
          );
          res.status(200).send({ data: { ...product._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Product not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
