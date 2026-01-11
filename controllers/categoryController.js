const Category = require("../models/categoryModal");
const fs = require("fs");
const mongoose = require("mongoose");
module.exports = {
  // function to add category
  addCategory: async (req, res) => {
    try {
      const { categoryName } = req.body;
      const categoryImageFile = req.file;

      if (!categoryName || !categoryImageFile) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const categoryData = await Category.findOne({
        categoryName: categoryName,
        isDeleted: false,
      });
      if (categoryData) {
        return res.status(400).json({
          isSuccess: false,
          message: "This category is already exists!",
        });
      }

      const category = new Category({
        categoryName: categoryName,
        categoryImage: req.file.path,
      });

      await category.save();

      res.status(200).json({
        isSuccess: true,
        message: "Category added successfully",
        category,
      });
    } catch (error) {
      console.error("Error while adding category:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },

  editCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryName } = req.body;
      const newImageFile = req.file;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await Category.findById(id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      if (categoryName && categoryName.trim() !== "") {
        const trimmedName = categoryName.trim();

        // Check duplicate EXCLUDING current category
        const existing = await Category.findOne({
          categoryName: trimmedName,
          _id: { $ne: id },
        });

        if (existing) {
          return res.status(400).json({
            message: "A category with this name already exists",
          });
        }

        category.categoryName = trimmedName;
      }

      if (newImageFile) {
        category.categoryImage = newImageFile.path;
      }

      await category.save();

      res.status(200).json({
        isSuccess: true,
        message: "Category updated successfully",
        category,
      });
    } catch (error) {
      console.error("Error editing category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to get all categories for admin
  getCategories: async (req, res) => {
    try {
      const categories = await Category.find({ isDeleted: false });
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched categories",
        categories,
      });
    } catch (error) {
      console.error("Error while getting all category:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to fetch active categories
  getActiveCategories: async (req, res) => {
    const categories = await Category.find({ status: true });
    res.status(200).json({
      isSuccess: true,
      message: "Successfully fetched categories",
      categories,
    });
    try {
    } catch (error) {
      console.error("Error while getting active category:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to add category
  getCategoryById: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await Category.findById(id);

      if (!category) {
        return res
          .status(404)
          .json({ message: "Category not found", isSuccess: false });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched categories",
        category: category,
      });
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to delete the category
  deleteCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      console.log(categoryId, "categoryIdsjfajdjf");

      const updated = await Category.findByIdAndUpdate(
        categoryId,
        { isDeleted: true, status: false },
        { new: true }
      );
      console.log(updated, "updated");

      if (!updated) {
        return res.status(404).json({ message: "Category not found" });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Category deleted successfully",
        category: updated,
      });
    } catch (error) {
      console.error("Error while deleting category by ID:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to change the status of the category
  toggleCategoryStatus: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          isSuccess: false,
          message: "Category not found",
        });
      }

      category.status = !category.status;
      await category.save();

      return res.status(200).json({
        isSuccess: true,
        message: "Category status updated successfully",
        data: category,
      });
    } catch (error) {
      console.error("Error while toggling category status", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
};
