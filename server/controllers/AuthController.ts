import {Request,Response} from "express"
import User from "../models/user.js";
import bcrypt from "bcrypt"

// Controllers for User Registertion
export const registerUser = async (req: Request, res: Response)=>{

    try {
        const  {name, email, password} = req.body;

        // find use by email 
        const user  = await User.findOne({email})
        if(user){
            return res.status(400).json({message:"User already exists"})
        }

        // Encrypt the password 
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await  bcrypt.hash(password, salt)

        const newUser = new User({
            name,
            email,
            password:hashPassword
        })
        await newUser.save()

        // setting user data in session 
        req.session.isLoggedIn = true;
        req.session.userId = newUser._id.toString();

        return  res.json({
            message:"User registered successfully",
            user:{
                id:newUser._id,
                name:newUser.name,
                email:newUser.email
            }
        })
    } catch (error: any) {
        console.log(error);
        res.status(500).json({message:error.message})
        
        
    }
}


// Controllers for User Login 
export const loginUser = async (req: Request, res: Response)=>{
    try {
        const  {email, password} = req.body;

        // find use by email 
        const user  = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid email or password"})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid Credentials"})
        }
        // setting user data in session 
        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();

        return res.json({
            message:"User logged in successfully",
            user:{
                _id:user._id,
                name:user.name,
                email:user.email
            }
        })
    } catch (error: any) {
        console.log(error);
        res.status(500).json({message:error.message})
    }
}

// Controller for User Logout 
export const logoutUser = (req: Request, res: Response)=>{
    req.session.destroy((err: any)=>{
        if(err){
            console.log(err);
            return res.status(500).json({message: err.message})
        }
        res.clearCookie('connect.sid');
        return res.json({message:"User logged out successfully"})
    })
}

// Controller for User Verify 
export const verifyUser = async (req: Request, res: Response)=>{
    try {
        const {userId} = req.session;
        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }
        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        return res.json({user});
    } catch (error: any) {
        console.log(error);
        res.status(500).json({message: error.message})
    }
}