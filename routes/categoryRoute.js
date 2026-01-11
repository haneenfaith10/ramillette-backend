const router = require("express").Router();
const categoryUpload = require("../utils/categoryUpload");

const {
  addCategory,
  getCategories,
  getActiveCategories,
  getCategoryById,
  editCategory,
  deleteCategory,
  toggleCategoryStatus
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authentication");

router.post(
  "/addCategory",
  categoryUpload.single("categoryImage"),
  addCategory
);
router.post(
  "/editCategory/:id",
  categoryUpload.single("categoryImage"),
  editCategory
);
router.get("/getCategories", getCategories);
router.get("/getActiveCategories", getActiveCategories);
router.get("/:id", getCategoryById);

router.put("/toggleCategoryStatus/:id",toggleCategoryStatus)

router.delete("/deleteCategory/:categoryId",authMiddleware,deleteCategory)

module.exports = router;
