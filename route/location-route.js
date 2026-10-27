import express from "express"
import { CreateLocation, GetLocations } from "../controller/location-controller.js"

const locationRoute = express.Router();

locationRoute.post("/location", CreateLocation);
locationRoute.get("/location", GetLocations)

export default locationRoute;
