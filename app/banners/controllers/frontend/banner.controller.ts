import { Request, Response } from 'express';
import Banner from '../../models/banner.model';
import { logger } from '../../../commons/logger.middleware';

export class BannerController {
  constructor() {}
  async getHomeBanner(req: Request, res: Response) {
    
    try {
     const bannerHorizontal = await Banner.find(
            {image_type:'h'},
      )
        .skip(0)
        .sort({date:-1})
        .limit(2);
        const bannerVertical = await Banner.find(
            {image_type:'v'}
          )
            .skip(0)
            .sort({date:-1})
            .limit(2);
            res.status(200).send({ data: {horizontal_banner:bannerHorizontal, vertical_banner:bannerVertical} });

    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}