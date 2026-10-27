import jwt from "jsonwebtoken";

const VerifyToken = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Token tidak ada" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ msg: "Token tidak valid" });
      }

      req.userId = decoded.userId;
      req.email = decoded.email;
      req.role = decoded.role;

      // cek role jika ada parameter roles
      if (roles.length > 0 && !roles.includes(req.role)) {
        return res.status(403).json({ msg: "Akses ditolak" });
      }

      next();
    });
  };
};

export default VerifyToken;
