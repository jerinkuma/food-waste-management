
const jwt = require("jsonwebtoken");

// =====================================
// Extract & verify JWT from Authorization header
// =====================================
function readToken(req) {
  const header = req.headers.authorization || "";

  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
}

// =====================================
// PROTECT: route requires a valid logged-in user
// =====================================
const protect = (req, res, next) => {
  try {
    const token = readToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =====================================
    // IMPORTANT
    //
    // Keep BOTH id and _id because different
    // controllers in the project use both.
    // =====================================
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error(
      "Authentication middleware error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Session expired or invalid token. Please log in again.",
    });
  }
};

// =====================================
// OPTIONAL AUTH
//
// Attaches req.user if a valid token exists,
// but never blocks the request.
//
// Useful for public GET endpoints that may
// personalize the response.
// =====================================
const optionalAuth = (req, res, next) => {
  try {
    const token = readToken(req);

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = {
        id: decoded.id,
        _id: decoded.id,
        role: decoded.role,
      };
    }
  } catch (error) {
    // Ignore invalid token for optional auth
  }

  next();
};

// =====================================
// RESTRICT TO SPECIFIC ROLES
// =====================================
const restrictTo = (...roles) => (req, res, next) => {
  if (
    !req.user ||
    !roles.includes(req.user.role)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "You do not have permission to perform this action.",
    });
  }

  next();
};

// =====================================
// EXPORT
// =====================================
module.exports = {
  protect,
  optionalAuth,
  restrictTo,
};

