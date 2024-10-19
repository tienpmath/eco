import express from 'express';
import path from 'path';
import fs from 'fs';
import Currency from '../models/currency.model';
export class SharedController {
  constructor() {}
  async getImage(req: express.Request, res: express.Response) {
    try {
      res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Disposition', `attachment; filename=${req.params['url']}`);
      res.status(200).sendFile(path.join(__dirname.replace('dist/shared/controllers', ''), '/upload/images/') + req.params['url']);
    } catch (error) {
      res.status(404).send({ error: 'Image not found' });
    }
  }

  async currenyIcon(req: express.Request, res: express.Response) {
    try {
      Currency.find()
        .then((currency: any) => {
          res.status(200).send({ status: 1, message: 'Success', currency: currency[0].currency });
        })
        .catch(() => {
          res.status(200).send({ message: 'Currency not found' });
        });
    } catch (error) {
      res.status(200).send({ error: 'Image not found' });
    }
  }

  async postImage(req: express.Request, res: express.Response) {
    res.status(200).send({ image: (req.file as { filename: string }).filename });
  }
  async deletImage(req: express.Request, res: express.Response) {
    fs.unlinkSync(path.join(__dirname.replace('dist/shared/controllers', ''), '/upload/images/') + req.params['url']);
    res.status(200).send({ message: 'image deleted' });
  }
}
