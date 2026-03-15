import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated =async(req ,res,next)=>{
    try {
        const authHeader = req.headers.authorization || "";
        const bearerToken = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : "";
        const cookieToken = req.cookies.token || "";
        const candidateTokens = [cookieToken, bearerToken].filter(Boolean);

        if(candidateTokens.length === 0){
            return res.status(401).json({
                message:"User not authenticated",
                success:false
            })
        }

        let decode = null;
        let verifiedToken = "";

        for (const token of candidateTokens) {
            try {
                decode = await jwt.verify(token, process.env.SECRET_KEY);
                verifiedToken = token;
                break;
            } catch {
                // Try the next available token source.
            }
        }

        if(!decode){
            return res.status(401).json({
                message:"Invalid token",
                success:false
            })
        }
        const user = await User.findById(decode.userId).select("-password");
        if(!user){
            return res.status(401).json({
                message:"User not found",
                success:false
            })
        }
        req.id = decode.userId;
        req.user = user;
        req.authToken = verifiedToken;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message:"Invalid token",
            success:false
        })
    }
}
export default isAuthenticated;