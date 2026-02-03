// controllers to get all User Thumbnails 

import { Request, Response } from "express";
import { Thumbnail } from "../models/Thumbnail.js";

export const getUserThumbnails = async (req: Request, res: Response) => {
    try {
        const {userId} = req.session;
        const thumbnails = await Thumbnail.find({userId}).sort({createdAt: -1});
        res.json({thumbnails});
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}
// controllers to get Single User Thumbnail by ID

export const getThumbnailById = async (req: Request, res: Response) => {
    try {
        const {userId} = req.session;
        const {id} = req.params;
        const thumbnail = await Thumbnail.findOne({userId, _id: id});
        res.json({thumbnail});
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}
