import Messages from "../model/message-model.js"
import Users from "../model/user-model.js"
import { getIO } from "../util/socket.js"
import { Op } from "sequelize";


export const SendMessages = async (req, res) => {
  try {
    const { receriver_id, message } = req.body;
    const userId = req.userId;

    if (!receriver_id || !message) {
      return res.status(400).json({ msg: "Data tidak lengkap" });
    }

    const sender = await Users.findByPk(userId);
    if (!sender) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const receiver = await Users.findByPk(receriver_id);
    if (!receiver) {
      return res.status(404).json({ msg: "Receiver tidak ditemukan" });
    }

    const newMessage = await Messages.create({
      sender_id: sender.id,
      receriver_id: receiver.id,
      message: message
    });

    const io = getIO();

    // 🔥 KIRIM REALTIME KE USER TUJUAN
    io.to("user_" + receiver.id).emit("newMessage", {
      sender: sender.name,
      message: message,
      createdAt: newMessage.createdAt
    });

    res.json({
      msg: "Pesan berhasil terkirim",
      data: newMessage
    });

  } catch (error) {
    console.error("❌ ERROR SEND MESSAGE:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};


export const getMessageByUser = async (req, res) => {

    const userId = req.userId;

    const users = await Users.findByPk(userId);

    if(!users){
      return res.status(404).json({msg:"user tidak di temukan"});
    }

    const messagebyuser = await Messages.findAll({
      where:{
        receriver_id: users.id
      }
    })

    res.json({msg:"sucess", status:200, data: messagebyuser})
}

export const GetChatByUser = async (req, res) => {
  const userId = req.params.id;
  const currentUserId = req.userId; // dari middleware JWT

  const messages = await Messages.findAll({
    where: {
      [Op.or]: [
        {
          sender_id: currentUserId,
          receriver_id: userId
        },
        {
          sender_id: userId,
          receriver_id: currentUserId
        }
      ]
    },
    order: [["createdAt", "ASC"]]
  });

  res.json(messages);
};