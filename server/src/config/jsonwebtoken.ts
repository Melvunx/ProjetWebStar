import jwt from "jsonwebtoken";

const { SECRETKEY } = process.env;

export async function generateToken(username: string) {
  return jwt.sign({ username }, SECRETKEY || "melvunxWebStar", {
    expiresIn: "3h",
  });
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRETKEY || "melvunxWebStar");
    return decoded;
  } catch {
    return null;
  }
}
