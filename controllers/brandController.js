const Brand = require("../models/brandModel");

module.exports = {
  // function to crate new product brand
  createBrand: async (req, res) => {
    try {
      const { brandName } = req.body;
      if (!req.file) {
        return res.status(404).json({
          isSuccess: false,
          message: "brand image not found",
        });
      }
      const newBrand = new Brand({
        brandName,
        brandImage: req.file.path,
      });
      await newBrand.save();
      res.status(200).json({
        isSuccess: true,
        message: "Brand created Successfully!",
      });
    } catch (error) {
      console.error("Error while creating brand :", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to get product brands
  getBrands: async (req, res) => {
    try {
      const brands = await Brand.find({ isDeleted: false }).sort({
        createdAt: -1,
      });
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched product brans",
        brands,
      });
    } catch (error) {
      console.error("Error while getting product brand :", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to change the status of the brand
  changeBrandStatus: async (req, res) => {
    try {
      const { brandId } = req.body;
      const brandData = await Brand.findById(brandId);
      if (!brandData) {
        return res.status(404).json({
          isSuccess: false,
          message: "Brand not found",
        });
      }
      const updatedBrand = await Brand.findByIdAndUpdate(
        brandId,
        { status: !brandData.status },
        { new: true }
      );
      res.status(200).json({
        isSuccess: true,
        message: "Brand status changed successfully",
        brand: updatedBrand,
      });
    } catch (error) {
      console.error("Error while changing product brand status:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to delete the brand
  deleteBrand: async (req, res) => {
    try {
      const { brandId } = req.body;

      const brandData = await Brand.findById(brandId);
      if (!brandData) {
        return res.status(404).json({
          isSuccess: false,
          message: "Brand not found",
        });
      }
      const brand = await Brand.findByIdAndUpdate(
        brandId,
        { isDeleted: true, status: false },
        { new: true }
      );
      res.status(200).json({
        isSuccess: true,
        message: "Brand deleted successfully",
        brand,
      });
    } catch (error) {
      console.error("Error while deleting product brand:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  // function to update the brand details
  updateBrandDetails: async (req, res) => {
    try {
      const { brandId, brandName } = req.body;
      const file = req.file;
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found." });
      }

      brand.brandName = brandName;
      if (file && file.path) {
        brand.brandImage = file.path;
      }

      await brand.save();
      res.status(200).json({
        isSuccess: true,
        message: "Brand details updated successfully",
        brand,
      });
    } catch (error) {
      console.error("Error while updating brand details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
};
