const SocialMedia = require("../models/socialMediaModel");

module.exports = {
  updateSocialLinks: async (req, res) => {
    try { 
      const { facebook, instagram, twitter, youtube } = req.body;
      let links = await SocialMedia.findOne();

      if (!links) {
        links = new SocialMedia({ facebook, instagram, twitter, youtube });
      } else {
        links.facebook = facebook;
        links.instagram = instagram;
        links.twitter = twitter;
        links.youtube = youtube;
      }

      await links.save();
      res.status(200).json({
        isSuccess: true,
        message: "Social media links updated",
        links,
      });
    } catch (error) {
      console.log("Error while posting social media links");
      res
        .status(500)
        .json({ isSuccess: false, message: "Internal server error!" });
    }
  },
  //   function to get the social media links
  getSocialMediaLinks: async (req, res) => {
    try {
      const socialMediaLinks = await SocialMedia.findOne({});

      if(!socialMediaLinks){
        return res.status(400).json({
            isSuccess:false,
            message:"No social media links available!"
        })
      }
      res
        .status(200)
        .json({
          isSuccess: true,
          message: "Successfully fetched social links",
          links: socialMediaLinks,
        });
    } catch (error) {
      console.log("Error while getting social media links");
      res
        .status(500)
        .json({ isSuccess: false, message: "Internal server error!" });
    }
  },
};
