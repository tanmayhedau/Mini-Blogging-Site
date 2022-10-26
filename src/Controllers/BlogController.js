const mongoose = require("mongoose");
const blogModel = require("../Models/BlogModel");
const authorModel = require("../Models/AuthorModel");
const moment = require("moment");

//==============================================================createBlog=========================================================================

const createBlog = async (req, res) => {
  try {
    let { title, body, authorId, category, isPublished } = req.body;

    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: "title is not present" });
    }
    if (typeof title != "string") {
      return res
        .status(400)
        .send({ status: false, message: "title should be in String" });
    }
    if (!body) {
      return res
        .status(400)
        .send({ status: false, message: "body is not present" });
    }
    if (typeof body != "string") {
      return res
        .status(400)
        .send({ status: false, message: "body should be in String" });
    }
    if (!authorId) {
      return res
        .status(400)
        .send({ status: false, message: "AuthorID is not present" });
    }
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res
        .status(400)
        .send({ status: false, message: "authorId is invalid" });
    }
    if (!category) {
      return res
        .status(400)
        .send({ status: false, message: "category is not present" });
    }
    if (typeof category != "string") {
      return res
        .status(400)
        .send({ status: false, message: "category should be in String" });
    }

    let validId = await authorModel.findOne({ _id: authorId });
    if (!validId) {
      return res
        .status(404)
        .send({ status: false, message: " AuthorId not found" });
    }

    if (typeof isPublished != "boolean") {
      return res.status(400).send({
        status: false,
        message: "isPublished should be false or true",
      });
    }

    if (isPublished == true) {
      req.body.publishedAt = moment().format();
    }

    let blogCreated = await blogModel.create(req.body);
    res.status(201).send({ status: true, message: blogCreated });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//=============================================================getBlogs=============================================================================

// Returns all blogs in the collection that aren't deleted and are published
// Return the HTTP status 200 if any documents are found. The response structure should be like this
// If no documents are found then return an HTTP status 404 with a response like this
// Filter blogs list by applying filters. Query param can have any combination of below filters.
// By author Id
// By category
// List of blogs that have a specific tag
// List of blogs that have a specific subcategory example of a query url: blogs?filtername=filtervalue&f2=fv2

const getBlogs = async (req, res) => {
  try {
    let data = req.query;

    let filter = { isDeleted: false, isPublished: true };

    const { category, subcategory, tags, authorId } = data;

    if (category) {
      let verifyCategory = await blogModel.findOne({ category: category });
      if (!verifyCategory) {
        return res
          .status(404)
          .send({ status: false, message: "No blogs in this category exist" });
      }
    }
    if (authorId) {
      // if (!req.query.authorId) return res.status(400).send({ status: false, msg: "authorId cant be null" })
      let isValid = mongoose.Types.ObjectId.isValid(authorId);
      if (isValid == false)
        return res
          .status(400)
          .send({ status: false, message: "Invalid length of authorId" });

      let verifyAuthorId = await blogModel.findOne({ authorId: authorId });
      if (!verifyAuthorId) {
        return res.status(404).send({
          status: false,
          message: "No blogs with this authorId exist",
        });
      }
    }

    if (tags) {
      let verifyTags = await blogModel.findOne({ tags: tags });
      if (!verifyTags) {
        return res
          .status(404)
          .send({ status: false, message: "No blogs in this category exist" });
      }
    }

    if (subcategory) {
      let verifysubcategory = await blogModel.findOne({subcategory: subcategory});
      if (!verifysubcategory) {
        return res.status(404).send({
          status: false,
          message: "No blogs in this subcategory exist",
        });
      }
    }

    filter = { ...data, ...filter };
    let getSpecificBlogs = await blogModel.find(filter);

    if (getSpecificBlogs.length == 0) {
      return res
        .status(404)
        .send({ status: false, message: "No blogs can be found" });
    } else {
      return res.status(200).send({ status: true, data: getSpecificBlogs });
    }
  } catch (error) {
    return res.status(500).send({ status: false, err: error.message });
  }
};

//===============================================================updateBlog======================================================================
// Updates a blog by changing the its title, body, adding tags, adding a subcategory.
// (Assuming tag and subcategory received in body is need to be added)
// Updates a blog by changing its publish status i.e. adds publishedAt date and set published to true
// Check if the blogId exists (must have isDeleted false).
// If it doesn't, return an HTTP status 404 with a response body like this
// Return an HTTP status 200 if updated successfully with a body like this
// Also make sure in the response you return the updated blog document.

const updatedBlog = async function (req, res) {
  try {
    let data = req.body;
    let date = moment().format();
    let filter = { isDeleted: false };

    let blogId = req.params.blogId;
    let savedData = await blogModel.findById({ _id: blogId });
    if (!savedData) {
      return res.status(404).send({ status: false, message: "invalid blogId" });
    }

    if (req.authorLoggedIn.authorId != savedData.authorId) {
      res.status(403).send({ status: false, message: "unauthorised author" });
    }

    if (savedData.isDeleted == false) {
      if (savedData.isPublished == false || savedData.isPublished == true) {
        if (data["title"]) {
          if (typeof data["title"] === "string") {
            filter["title"] = data["title"];
          }
        }
        if (data["body"]) {
          if (typeof data["body"] === "string") {
            filter["body"] = data["body"];
          }
        }
        if (data["tags"]) {
          if (Array.isArray(data["tags"])) {
            filter["tags"] = savedData.tags.concat(data["tags"]);
          }
        }
        if (data["subcategory"]) {
          if (Array.isArray(data["subcategory"])) {
            filter["subcategory"] = savedData.subcategory.concat(data["subcategory"] );
          }
        }
        filter["isPublished"] = true;
        filter["publishedAt"] = date;
      }
      let updatedData = await blogModel.findByIdAndUpdate(
        { _id: blogId },
        filter,
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "updated successfully",
        data: updatedData,
      });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "Unable to find blog" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//====================================================================deleteBlogparams=================================================================
// Check if the blogId exists( and is not deleted). If it does, mark it deleted and return an HTTP status 200 without any response body.
// If the blog document doesn't exist then return an HTTP status of 404 with a body like this

const deleteBlogById = async (req, res) => {
  try {
    let blogId = req.params.blogId;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res
        .status(400)
        .send({ status: false, message: `${blogId} is invalid` });
    }
    let savedData = await blogModel.findOne({ _id: blogId, isDeleted: false });

    if (!savedData) {
      return res.status(404).send({ status: false, message: "blog not found" });
    } else {
      if (req.authorLoggedIn.authorId != savedData.authorId) {
        res.status(403).send({ status: false, message: "unauthorised author" });
      }

      let updatedData = await blogModel.findByIdAndUpdate(
        { _id: blogId },
        { isDeleted: true },
        { new: true }
      );
      return res.status(200).send({
        status: true,
        message: "deleted successfully",
        data: updatedData,
      });
    }
  } catch (error) {
    res.status(500).send({ status: false, err: error.message });
  }
};

//===========================================================deleteBlogQueryParams===================================================================
// Delete blog documents by category, authorid, tag name, subcategory name, unpublished
// If the blog document doesn't exist then return an HTTP status of 404 with a body

let deleteBlog = async (req, res) => {
  try {
    let data = req.query;

    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Blog details is mandatory" });
    }

    let filter = { isDeleted: false, isPublished: false };

    if (data["authorId"]) {
      if (!mongoose.Types.ObjectId.isValid(data["authorId"])) {
        return res
          .status(400)
          .send({ status: false, message: "authorId is not valid" });
      }

      filter["authorId"] = data["authorId"];

      if (req.authorLoggedIn.authorId != filter["authorId"]) {
        return res
          .status(403)
          .send({ status: false, message: "unauthorised author" });
      }
    } else {
      filter["authorId"] = req.authorLoggedIn.authorId;
    }

    if (data["category"]) {
      filter["category"] = data["category"];
    }

    if (data["tags"]) {
      filter["tags"] = data["tags"];
    }
    if (data["subcategory"]) {
      filter["subcategory"] = data["subcategory"];
    }

    let savedData = await blogModel.updateMany(filter, { isDeleted: true });

    if (savedData.modifiedCount == 0) {
      return res
        .status(404)
        .send({ status: false, message: "No document found" });
    }

    return res
      .status(200)
      .send({ status: true, message: "deleted successfully", data: savedData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  updatedBlog,
  deleteBlog,
  deleteBlogById,
};
