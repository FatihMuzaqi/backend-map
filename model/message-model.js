import db from "../config/db.js"
import { Sequelize } from "sequelize"

const Messages = db.define("message", {
	sender_id:{
		type: Sequelize.INTEGER,
   	 allowNull: false
	},
	receriver_id:{
		type: Sequelize.INTEGER,
    	allowNull: false
	},
	message:{
		type:Sequelize.STRING,
		allowNull: false
	},
}, {
	freezeTabelName: true
})


export default Messages