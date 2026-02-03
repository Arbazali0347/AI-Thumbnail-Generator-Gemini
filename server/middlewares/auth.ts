import {Request, Response, NextFunction} from 'express';

const protect = (req: Request, res: Response, next: NextFunction) => {
    const {isLoggedIn, userId} = req.session;
    if(!isLoggedIn || !userId){
        return res.status(401).json({message:"Your are not Logged In"});
    }
    next();
}

export default protect;
