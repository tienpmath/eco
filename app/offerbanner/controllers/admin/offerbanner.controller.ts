/* eslint-disable indent */
import { Request, Response } from 'express';
import moment from 'moment';
import OfferBanner from '../../models/offerbanner.model';
import { dateFormate } from '../../../commons/constants';
const { ObjectId } = require('mongodb');

export class OfferBannerController {
  constructor() {}
  async createOfferBaner(req: Request, res: Response) {
    const cId = new ObjectId();
    const cDate = moment().format(dateFormate);
    const banner = new OfferBanner({
      _id: cId,
      int_glcode: cId.toString(),
      created_date: cDate,
      updated_date: cDate,
      ...req.body,
    });
    try {
      banner
        .save()
        .then(() => {
          res.status(200).send({ message: 'Offer banner created' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async updateOfferBannerById(req: Request, res: Response) {
    const cDate = moment().format('MM ddd, YYYY HH:mm:ss');
    const banner = new OfferBanner({
      updated_date: cDate,
      ...req.body,
    });
    try {
      OfferBanner.findOneAndUpdate({ int_glcode: req.params.id }, banner, {
        new: true,
        upsert: true,
      })
        .then(() => {
          res.status(200).send({ message: 'Offer banner updated' });
        })
        .catch((e) => {
          res.status(500).send({ message: e });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async deleteOfferBannerById(req: Request, res: Response) {
    try {
      OfferBanner.findOneAndDelete({ _id: req.params.id })
        .then(() => {
          res.status(200).send({ message: 'Offer banner deleted' });
        })
        .catch(() => {
          res.status(404).send({ message: 'Offer banner not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getAllOfferBanner(req: Request, res: Response) {
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
      OfferBanner.find(
        req.body.search && req.body.search.length > 0
          ? {
              $and: [{ var_title: { $regex: req.body.search, $options: 'i' } },{
                chr_publish: "Y"               
              }],
            }
          : {
            chr_publish: "Y"               
          },
      )
        .skip(page)
        .sort(sort)
        .limit(limit)
        .then((offersBanners: any) => {
          
          OfferBanner.countDocuments(
            req.body.search && req.body.search.length > 0
              ? {
                  $or: [{ var_title: { $regex: req.body.search, $options: 'i' } }],
                }
              : {},
          ).then((count: any) => {
            res.status(200).send({ data: offersBanners, total: count });
          });
        })
        .catch(() => {
          res.status(404).send({ message: 'Offer banner not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
  async getOfferBannerById(req: Request, res: Response) {
    try {
      OfferBanner.findOne({ _id: req.params.id })
        .then((banner: any) => {
          res.status(200).send({ data: { ...banner._doc } });
        })
        .catch(() => {
          res.status(404).send({ message: 'Offer banner not found' });
        });
    } catch (e) {
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}
