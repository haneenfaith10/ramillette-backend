const Settings = require("../models/settingsModel");
const SocialMedia = require("../models/socialMediaModel");
const nodemailer = require("nodemailer");

module.exports = {
  saveSettings: async (req, res) => {
    try {
      const {
        companyName,
        companyLocation,
        companyEmail,
        address,
        phoneNumber,
        supportEmail,
      } = req.body;
      
      if (
        !companyName ||
        !companyLocation ||
        !companyEmail ||
        !address ||
        !phoneNumber ||
        !supportEmail
      ) {
        return res.status(400).json({
          message: "All fields are required",
          isSuccess: false,
        });
      }

      let result;
      const existingSettings = await Settings.findOne();

      if (existingSettings) {
        existingSettings.companyName = companyName;
        existingSettings.companyLocation = companyLocation;
        existingSettings.companyEmail = companyEmail;
        existingSettings.companySupportEmail = supportEmail;
        existingSettings.companyPhoneNumber = phoneNumber;
        existingSettings.companyAddress = address;

        result = await existingSettings.save();
      } else {
        const newSettings = new Settings({
          companyName,
          companyLocation,
          companyEmail,
          companySupportEmail: supportEmail,
          companyPhoneNumber: phoneNumber,
          companyAddress: address,
        });

        result = await newSettings.save();
      }

      return res.status(200).json({
        message: "Settings saved successfully",
        data: result,
        isSuccess: true,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", isSuccess: false });
    }
  },
  getSettings: async (req, res) => {
    try {
      const settings = await Settings.findOne().sort({ createdAt: -1 });
      const links = await SocialMedia.findOne({});

      if (!settings) {
        return res
          .status(404)
          .json({ message: "Settings not found", isSuccess: false });
      }

      return res.status(200).json({
        message: "success",
        data: { settings, links },
        isSuccess: true,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to post the contact us form data
  postContactFormData: async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !phone || !subject || !message) {
        return res
          .status(400)
          .json({ success: false, msg: "All fields are required" });
      }

      const adminMail = await Settings.findOne();

      if (!adminMail) {
        return res.status(404).json({
          isSuccess: false,
          message: "Company mail not found !!",
        });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: adminMail.companyEmail,
        subject: `Contact Form - ${subject}`,
        html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
      };

      await transporter.sendMail(mailOptions);
      res
        .status(200)
        .json({ isSuccess: true, message: "Email sent Successfully" });
    } catch (error) {
      console.error("Error while sending contact form data:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
