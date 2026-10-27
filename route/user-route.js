import express from "express"
import { Register, Login, Logout, RefreshToken, getUsers, TrackingUser } from "../controller/auth-controller.js"
import VerifyToken from "../middleware/verifytoken-middleware.js"

const authRoute = express.Router();

authRoute.get("/users", VerifyToken(["admin"]) ,getUsers);
authRoute.post("/register", Register);
authRoute.post("/login", Login);
authRoute.delete("/logout", Logout);
authRoute.get("/token", RefreshToken);
authRoute.patch("/tracking", VerifyToken(), TrackingUser);



export default authRoute;  