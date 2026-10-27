import express from "express"
import {SendMessages, getMessageByUser, GetChatByUser} from "../controller/message-controller.js"
import VerifyToken from "../middleware/verifytoken-middleware.js"

const messageRoute = express.Router();

messageRoute.post("/message", VerifyToken() ,SendMessages);
messageRoute.get("/message", VerifyToken(), getMessageByUser);
messageRoute.get("/message/:id", VerifyToken(), GetChatByUser)

export default messageRoute;