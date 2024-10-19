/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import SubCategory from '../../models/subcategory.model';
import { dateFormate } from '../../../../commons/constants';
import { logger } from '../../../../commons/logger.middleware';
const { ObjectId } = require('mongodb');

export class SubCategoryController {
  constructor() {}
  async createCategory(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    req.body.is_home_active = req.body.is_home_active == 'true' ? true : false;
    const category = new SubCategory({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      is_active: true,
      var_icon: (req.file as { filename: string }).filename,
      viewCount: 0,
      var_slug: req.body.var_title.toString().replace(' ', '-'),
      soldCount: 0,
      ...req.body,
    });
    try {
      category
        .save()
        .then(() => {
          res.status(200).send({ message: 'Sub Category created' });
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
      SubCategory.findOneAndUpdate(
        { int_glcode: req.params.id },
        { $set: category },
        {
          new: false,
          overwrite: true,
        },
      )
        .then(() => {
          res.status(200).send({ message: 'Sub Category updated' });
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
        await SubCategory.findOneAndDelete({ _id: ids[i] });
      }
      res.status(200).send({ message: 'Sub Category deleted' });
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
      SubCategory.aggregate([
        {
          $lookup: {
            from: 'categories',
            as: 'category',
            let: { int_glcode: '$fk_parent' },
            pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
          },
        },
        {
          $match:
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } },{"category.var_title":{ $regex: req.body.search, $options: 'i' }}],
                }
              : {},
        },
        { $sort: sort },
        { $limit: limit + page },
        { $skip: page },
       
      ])

        .then((categories: any) => {
          SubCategory.aggregate([
            {
              $lookup: {
                from: 'categories',
                as: 'category',
                let: { int_glcode: '$fk_parent' },
                pipeline: [{ $match: { $expr: { $eq: ['$int_glcode', '$$int_glcode'] } } }],
              },
            },
            {
              $match:
                req.body.search && req.body.search.length > 0
                  ? {
                      $or: [{ var_title: { $regex: req.body.search, $options: 'i' } },{"category.var_title":{ $regex: req.body.search, $options: 'i' }}],
                    }
                  : {},
            },
            { $sort: sort },
            { $limit: limit + page },
            { $skip: page },
           
          ]).then((count: any) => {
            res.status(200).send({ data: categories, total: count.length });
          });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: 'Sub Categories not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }

  async getAllCategoryByParent(req: Request, res: Response) {
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
      SubCategory.find({ fk_parent: req.params.pid })
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((categories: any) => {
          SubCategory.countDocuments(
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
          res.status(500).send({ message: 'Sub Categories not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getCategoryById(req: Request, res: Response) {
    try {
      SubCategory.findOne({ _id: req.params.id })
        .then((category: any) => {
          res.status(200).send({ data: { ...category._doc } });
        })
        .catch((e) => {
          logger.error('', e);
          res.status(500).send({ message: 'Sub Category not found' });
        });
    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
