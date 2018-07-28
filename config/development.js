module.exports = {
  // enabled logging for development
  logging: true,
  db_url:process.env.DB_URL,
  passport_secret:process.env.PASS_SECRET,
  adminCode:process.env.ADMIN_CODE,
  gmailAddress:process.env.GMAIL_ADRESS,
  gmailPW:process.env.GMAIL_PW,
  cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret:process.env.CLOUDINARY_API_SECRET,
  cloudinaryCloudName:process.env.CLOUD_NAME
};