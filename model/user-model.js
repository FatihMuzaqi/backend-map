import db from "../config/db.js"
import { Sequelize } from "sequelize"

const Users = db.define("user", {
	name:{
		type:Sequelize.STRING,
		allowNull:false,
	},
	email:{
		type:Sequelize.STRING,
		allowNull:false
	},
	password:{
		type:Sequelize.STRING,
		allowNull:false
	},
	refresh_token:{
		type:Sequelize.TEXT,
		allowNull:true
	},
	role:{
		type:Sequelize.ENUM("admin", "user"),
		allowNull:false,
		defaultValue:("user")
	},
	latitude:{
		type:Sequelize.FLOAT,
		allowNull:true
	},
	longitude:{
		type:Sequelize.FLOAT,
		allowNull:true
	},
	status_area:{
		type:Sequelize.ENUM("inside", "outside"),
		allowNull:true
	}
}, {
	freezeTabelName: true
}) 

export default Users