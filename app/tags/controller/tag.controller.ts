/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import Tag from '../models/tag.model';
import { dateFormate } from '../../commons/constants';
const { ObjectId } = require('mongodb');

export class TagController {
  constructor() {}
  async createTag(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const tag = new Tag({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      var_icon: req.file!.filename,
      is_active: true,
      ...req.body,
    });
    try {
      tag
        .save()
        .then(() => {
          res.status(200).send({ message: 'Tag created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateTagById(req: Request, res: Response) {
    const cDate = moment().format(dateFormate);
    let tag;
    if (req.file) {
      tag = new Tag({
        updated_date: cDate,
        var_icon: req.file!.filename,
        ...req.body,
      });
    } else {
      tag = new Tag({
        updated_date: cDate,
        ...req.body,
      });
    }
    try {
      Tag.findOneAndUpdate({ int_glcode: req.params.id }, tag, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Tag updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteTagById(req: Request, res: Response) {
    try {
      const ids = req.params.ids.split(',');
      for (let i = 0; i < ids.length; i++) {
        await Tag.findOneAndDelete({ _id: ids[i] });
      }
      res.status(200).send({ message: 'Tag deleted' });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllTag(req: Request, res: Response) {
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
      Tag.find(
        req.body.search && req.body.search.length > 0
          ? {
              $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
            }
          : {},
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((tags: any) => {
          Tag.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: tags, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Tag not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getTagById(req: Request, res: Response) {
    try {
      Tag.findOne({ _id: req.params.id })
        .then((tag: any) => {
          res.status(200).send({ data: { ...tag._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Tag not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
