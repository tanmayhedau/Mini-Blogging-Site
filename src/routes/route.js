const express = require('express');
const router = express.Router();
const authorController = require("../Controllers/AuthorController")
const blogController = require("../Controllers/BlogController")
const blogMW = require("../MiddleWare/commonMW")


router.post("/authors", authorController.createAuthor)

router.post("/blogs", blogMW.authentication, blogController.createBlog)

router.get("/blogs", blogMW.authentication, blogController.getBlogs)

router.put("/blogs/:blogId", blogMW.authentication, blogController.updatedBlog)

router.delete("/blogs", blogMW.authentication, blogController.deleteBlog)

router.delete("/blogs/:blogId", blogMW.authentication, blogController.deleteBlogById)

router.post("/login", authorController.loginAuthor)




module.exports = router;