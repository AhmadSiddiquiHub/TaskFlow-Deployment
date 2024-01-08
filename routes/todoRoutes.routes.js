const express = require("express");
const router = express.Router();

const {
  createTodo,
  getAllTodo,
  updateTodo,
  deleteTodo,
  getSingleTodo,
  updateSubTodoStatus,
} = require("../controllers/todoControllers.controllers");
// Import Middlewares
const { authentication } = require("../middlewares/authMiddleware");

router.route("/").get(authentication, getAllTodo);
router.route("/:todoId").get(authentication, getSingleTodo);
router.route("/create-todo").post(authentication, createTodo);
router.route("/update-todo/:todoId").put(authentication, updateTodo);
router
  .route("/update-subTodo-status/:todoId")
  .put(authentication, updateSubTodoStatus);
router
  .route("/delete-todo/:todoId/:subTodoId?")
  .delete(authentication, deleteTodo);

module.exports = router;
