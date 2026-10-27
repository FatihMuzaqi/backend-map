import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import nodemailer from "nodemailer"
import { Server } from "socket.io"
import http from "http"
import db from "./config/db.js"
import Users from "./model/user-model.js"
import authRoute from "./route/user-route.js"
import Locations from "./model/location-model.js"
import {initSocket} from "./util/socket.js"
import Messages from "./model/message-model.js"
import messageRoute from "./route/message-route.js"
import locationRoute from "./route/location-route.js"

dotenv.config();
const app = express();
const server = http.createServer(app);

try{
	await db.authenticate();
	console.log("Database Connect")
	// Messages.sync();
	// Users.sync({alter:true});
	// Locations.sync();
}catch(error){
	console.log(error)
}

initSocket(server);


app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());



app.use("/api", authRoute);
app.use("/api", messageRoute);
app.use("/api", locationRoute);

server.listen(process.env.PORT , () => {
	console.log("Server berjalan di port http://localhost:" + process.env.PORT)
})

export default app
