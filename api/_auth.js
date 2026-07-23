import jwt from "jsonwebtoken";

/**
 * Parse cookies from the Cookie header string.
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join("=").trim());
  }
  return cookies;
}

/**
 * Verify the adminToken cookie. Returns true if valid, false + 401 response if not.
 */
export function requireAdmin(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.adminToken;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  try {
    jwt.verify(token, process.env.SESSION_SECRET);
    return true;
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
}
