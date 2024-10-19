/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Category from '../../models/category.model';
import { dateFormate } from '../../../../commons/constants';
import { logger } from '../../../../commons/logger.middleware';
const { ObjectId } = require('mongodb');

export class CategoryController {
  constructor() {}
  async createCategory(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const category = new Category({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      var_icon: (req.file as { filename: string }).filename,
      is_active: true,
      viewCount: 0,
      var_slug: req.body.var_title.toString().replace(' ', '-'),
      soldCount: 0,
      ...req.body,
    });
    try {
      category
        .save()
        .then(() => {
          res.status(200).send({ message: 'Category created' });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateCategoryById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    let category;
    if (req.file) {
      category = {
        updated_date: cDate,
        var_icon: req.file!.filename,
        ...req.body,
      };
    } else {
      category = {
        updated_date: cDate,
        ...req.body,
      };
    }
    try {
      Category.findOneAndUpdate(
        { int_glcode: req.params.id },
        { $set: category },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(() => {
          res.status(200).send({ message: 'Category updated' });
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
    async deleteCategoryById(req: Request, res: Response) {
      try {
        const ids = req.params.ids.split(',');
        for (let i = 0; i < ids.length; i++) {
          await Category.findOneAndDelete({ _id: ids[i] });
        }
        res.status(200).send({ message: 'Category deleted' });
      } catch (e) {
        logger.error('', e);
        res.status(500).send({ message: 'Unexpected error' });
      }
    }
  async getAllCategory(req: Request, res: Response) {
    let limit = 100;
    let page = 0;
    let sort = {};
    if (req.body.limit && req.body.page) {
      limit = req.body.limit;
      page = (req.body.page - 1) * req.body.limit;
    }
    if (req.body.sort) {
      sort = req.body.sort;
    }
    try {
      Category.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((categories: any) => {
          Category.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: categories, total: count });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Categories not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getCategoryById(req: Request, res: Response) {
    try {
      Category.findOne({ _id: req.params.id })
        .then((category: any) => {
          res.status(200).send({ data: { ...category._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(404).send({ message: 'Category not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
