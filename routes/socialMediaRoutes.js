const router = require("express").Router()

const { updateSocialLinks,getSocialMediaLinks } = require("../controllers/socialMediaController");
const authMiddleware = require("../middleware/authentication");

router.get('/getSocialMediaLinks',getSocialMediaLinks)

router.post("/postSocialLinks",authMiddleware,updateSocialLinks)


module.exports = router;