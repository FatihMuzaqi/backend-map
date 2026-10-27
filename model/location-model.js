import db from "../config/db.js"
import { Sequelize } from "sequelize"

const Locations = db.define("location", {
	name:{
		type:Sequelize.STRING,
		allowNull:false
	},
	latitude:{
		type:Sequelize.FLOAT,
		allowNull:true
	},
	longitude:{
		type:Sequelize.FLOAT,
		allowNull:true
	},
	radius:{
		type:Sequelize.INTEGER,
		allowNull:true
	}
}, {
	freezeTabelName:true
})

export default Locations