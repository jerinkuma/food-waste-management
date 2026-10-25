const express = require("express");
const router = express.Router();
const { searchGlobal } = require("../controllers/searchController");

// =====================================
// GLOBAL SEARCH ROUTE
// GET /api/search
// =====================================
router.get("/", searchGlobal);

module.exports = router;