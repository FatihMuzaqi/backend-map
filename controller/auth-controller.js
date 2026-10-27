import Users from "../model/user-model.js";
import Transporter from "../middleware/transporter-middleware.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getIO } from "../util/socket.js";

dotenv.config();

export const getUsers = async (req, res) => {
  const users = await Users.findAll();

  res.json({ msg: "success", status: 200, data: users });
};

export const Register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;

  const users = await Users.findOne({
    where: {
      email: email,
    },
  });

  if (users) {
    return res.status(409).json({ msg: "Email sudah ada di database" });
  }

  if (password !== confPassword) {
    return res
      .status(400)
      .json({ msg: "Password dan Konfirmasi Password Tidak Sama" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const newUsers = await Users.create({
      name: name,
      email: email,
      password: hashPassword,
    });
    res.json({ msg: "Register berhasil", data: newUsers });
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;

  const users = await Users.findOne({
    where: {
      email: email,
    },
  });

  if (!users) {
    return res.status(404).json({ msg: "Email belum terdaftar" });
  }

  const match = await bcrypt.compare(password, users.password);

  if (!match) {
    return res.status(403).json({ msg: "Paasword salah" });
  }

  const userId = users.id;
  const name = users.name;
  const emailToken = users.email;
  const role = users.role;
  const accessToken = jwt.sign(
    { userId, name, email: emailToken, role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    },
  );

  const refreshToken = jwt.sign(
    { userId, name, email: emailToken, role },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1d",
    },
  );

  try {
    await Users.update(
      {
        refresh_token: refreshToken,
      },
      {
        where: {
          id: userId,
        },
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      msg: "succes",
      status: 200,
      role: role,
      accessToken: accessToken,
    });
  } catch (error) {
    console.log(error);
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(409);
  }

  const users = await Users.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  await Users.update(
    { refresh_token: null },
    {
      where: {
        id: users.id,
      },
    },
  );

  res.clearCookie(refreshToken);
  return res.status(200).json({ msg: "Logout berhasil" });
};

export const RefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(409);
  }

  const users = await Users.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });

  if (!users) {
    return res
      .status(403)
      .json({ msg: "User tidak ditemukan / token tidak valid" });
  }

  const usersId = users.id;
  const name = users.name;
  const email = users.email;
  const role = users.role;
  const accessToken = jwt.sign(
    { usersId, name, email, role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1h",
    },
  );

  res.json({ msg: "success", status: 200, msg: accessToken });
};

export const TrackingUser = async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ msg: "Latitude & longitude wajib diisi" });
  }

  const users = await Users.findOne({
    where: {
      email: req.email,
    },
  });

  if (!users) {
    return res.status(404).json({ msg: "User tidak di temukan" });
  }

  await Users.update(
    {
      latitude: latitude,
      longitude: longitude,
    },
    {
      where: {
        id: users.id,
      },
    },
  );

  const io = getIO();

  // 🔥 EMIT REALTIME
  io.emit("updateLocation", {
    id: users.id, // 🔥 WAJIB
    name: users.name,
    email: users.email,
    latitude: latitude,
    longitude: longitude,
    status_area: users.status_area,
    refresh_token: users.refresh_token, // 🔥 WAJIB
  });

  console.log("🔥 EMIT:", users.name, latitude, longitude);

  res.json({ msg: "Berhasil mendapatkan lokasi user" });
};

export const ResetPassword = async (req, res) => {
  const { email } = req.body;

  const users = await Users.findOne({
    where: {
      email: email,
    },
  });

  if (!users) {
    return res.status(404).json({ msg: "Email tidak di temukan" });
  }

  await Transporter.sendMail({
    from: '"Reset Password" <fatih.muzaqi123@gmail.com>',
    to: email,
    subject: "Notifikasi Peminjaman Barang Inventaris",
    html: `
         	<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">

		    <div class="reset-container" style="background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px;">
		        
		        <h2 style="margin-top: 0; color: #333; text-align: center;">Atur Ulang Kata Sandi</h2>
		        <p style="font-size: 14px; color: #666; text-align: center; margin-bottom: 20px;">Silakan masukkan kata sandi baru Anda di bawah ini.</p>
		        
		        <form action="" method="POST">
		            <div class="input-group" style="margin-bottom: 15px;">
		                <label for="password" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Kata Sandi Baru</label>
		                <input type="password" id="password" name="password" required minlength="8" 
		                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
		            </div>

		            <div class="input-group" style="margin-bottom: 15px;">
		                <label for="confirm-password" style="display: block; margin-bottom: 5px; font-weight: bold; color: #555;">Konfirmasi Kata Sandi</label>
		                <input type="password" id="confirm-password" name="confirm-password" required 
		                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
		            </div>


		         	<a href="http://localhost:3000/update-password" class="btn-reset">
		                style="width: 100%; padding: 12px; background-color: #007bff; border: none; border-radius: 4px; color: white; font-size: 16px; cursor: pointer; transition: background 0.3s;"
		                onmouseover="this.style.backgroundColor='#0056b3'" 
		                onmouseout="this.style.backgroundColor='#007bff'">
		                Simpan Perubahan
		            </a>
		        </form>
		        
		        <div class="footer-link" style="margin-top: 15px; text-align: center;">
		            <a href="/login" style="color: #007bff; text-decoration: none; font-size: 13px;">Kembali ke Halaman Login</a>
		        </div>
		    </div>

		</body>
        `,
  });

  res.json({ msg: "seccess", status: 200 });
};
