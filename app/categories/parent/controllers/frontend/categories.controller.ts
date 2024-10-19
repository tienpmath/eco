import { Request, Response } from 'express';
import Category from '../../models/category.model';
import { logger } from '../../../../commons/logger.middleware';

export class CategoryController {
  constructor() {}
async getCetegory(req: Request, res: Response) {  
    try {
        
      Category.aggregate(
      req.params.withsubcat==='y'? [
        { $match: {
          is_active: true,
        },},
        { $match: {
          is_active: true,
        },},
        {
            $lookup:{
                from:'sub_categories',
                as:'sub_categories',
                let: { fk_parent: '$int_glcode' },
                pipeline: [{ $match: { $expr: { $eq: ['$fk_parent', '$$fk_parent'] } } }],
            }
        },
        {$limit:parseInt(req.params.limit)},
        {$skip:0},
        {
            $sort:{date:-1}
        }
       ]:[
        { $match: {
          is_active: true,
        },},
        { $match: {
          is_active: true,
        },},
        {$limit:parseInt(req.params.limit)},
        {$skip:0},
        {
            $sort:{date:-1}
        }
       ]
      )
        .then((categories: any) => {
            res.status(200).send({ data: categories = categories.reverse()});
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