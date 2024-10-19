/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import General from '../../models/metacontent.model';
import MetaConent from '../../models/metacontent.model';
import { dateFormate } from '../../../../commons/constants';
const { ObjectId } = require('mongodb');

export class MetaContentController {
  constructor() {}
  async createMetacontent(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const meta = new MetaConent({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      meta
        .save()
        .then(() => {
          res.status(200).send({ message: 'Meta conent created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateMetacontentById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    const meta = new MetaConent({
      updated_date: cDate,
      ...req.body,
    });
    try {
      MetaConent.findOneAndUpdate({ int_glcode: req.params.id }, meta, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Meta content updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteMetacontentById(req: Request, res: Response) {
    try {
      MetaConent.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Meta content deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Meta conent not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllMetaconent(req: Request, res: Response) {
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
      MetaConent.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((metacontent: any) => {
          MetaConent.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: metacontent, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Meta content not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getMetaConentById(req: Request, res: Response) {
    try {
      General.findOne({ _id: req.params.id })
        .then((metacontent: any) => {
          res.status(200).send({ data: { ...metacontent._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Meta content not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}