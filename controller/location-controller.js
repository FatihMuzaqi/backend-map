import Locations from "../model/location-model.js"

export const CreateLocation = async (req, res) => {
	const {name, latitude, longitude, radius} = req.body;

	const area = await Locations.findOne({
		where:{
			name: name
		}
	})

	if(area){
		return res.status(200).json({msg:"lokasi sudah ada"})
	}

	const newLocation = await Locations.create({
		name: name,
		latitude: latitude,
		longitude: longitude,
		radius : radius
	})

	res.json(newLocation);
}


export const GetLocations = async (req, res) => {
	const locations = await Locations.findAll();

	res.json(locations)
}