const Todo = require("../models/todoSchema.models");

// Create Todo
const createTodo = async (req, res, next) => {
  try {
    const { title, description, subTodo } = req.body;

    if (!title || !description || !subTodo) {
      res.status(400);
      throw new Error("Please fill all the fields!");
    }

    const todo = await Todo.create({
      title,
      description,
      subTodo,
      user: req.user, // Assuming req.user contains the user ID
    });

    if (!todo) {
      res.status(500);
      throw new Error("Todo Creation Failed!");
    }

    // Use aggregation to populate the 'user' field in the todo with the full user data
    await Todo.aggregate([
      {
        $match: { _id: todo._id }, // Match the newly created todo
      },
      {
        $lookup: {
          from: "users", // Assuming your users collection is named "users"
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user", // Unwind the user array created by $lookup
      },
      {
        $project: {
          title: 1,
          description: 1,
          subTodo: 1,
          user: { _id: 1, name: 1, email: 1, phoneNumber: 1, isAdmin: 1 }, // Include the fields you want from the user
        },
      },
    ]);

    return res.json({
      msg: "Todo Created Successfully!",
      // todo: populatedTodo[0], // The result is an array, take the first element
    });
  } catch (error) {
    next(error);
  }
};

// Get All Todos
const getAllTodo = async (req, res, next) => {
  try {
    // Assuming req.user contains the user ID
    const userId = req.user;

    // Use regular Mongoose query to find all todos for the logged-in user
    const todos = await Todo.find({ user: userId }).populate(
      "user",
      "_id name email phoneNumber isAdmin"
    ); // Populate the user field with specified fields

    return res.json({
      todos,
    });

    // Another way to do it using (Aggregation)
    // // Assuming req.user contains the user ID
    // const userId = req.user;

    // // Use aggregation to get all todos for the logged-in user with user details
    // const todos = await Todo.aggregate([
    //   {
    //     $match: { user: new mongoose.Types.ObjectId(userId) },
    //   },
    //   {
    //     $lookup: {
    //       from: "users",
    //       localField: "user",
    //       foreignField: "_id",
    //       as: "user",
    //     },
    //   },
    //   {
    //     $unwind: "$user",
    //   },
    //   {
    //     $project: {
    //       title: 1,
    //       description: 1,
    //       subTodo: 1,
    //       isComplete: 1,
    //       user: { _id: 1, name: 1, email: 1, phoneNumber: 1, isAdmin: 1 },
    //     },
    //   },
    // ]);

    // return res.json({
    //   msg: "All Todos Retrieved Successfully!",
    //   todos,
    // });
  } catch (error) {
    next(error);
  }
};

// Get Single Todo
const getSingleTodo = async (req, res, next) => {
  try {
    const { todoId } = req.params;
    const userId = req.user;

    const todo = await Todo.findOne({ _id: todoId, user: userId }).populate(
      "user",
      "_id name email phoneNumber isAdmin"
    );
    return res.json({
      todo,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubTodoStatus = async (req, res, next) => {
  try {
    const { subId, subStatus } = req.body;
    const { todoId } = req.params;

    // Assuming req.user contains the user ID
    const userId = req.user;

    // Check if the user has permission to update the todo
    const todo = await Todo.findOne({ _id: todoId, user: userId }).populate(
      "user",
      "_id name email phoneNumber isAdmin"
    ); // Populate the user field with specified fields

    if (!todo) {
      res.status(404).json({
        error: "Todo not found or you don't have permission to update it",
      });
      return;
    }

    // Find the index of the subTodo with the given subId
    const subTodoIndex = todo.subTodo.findIndex((sub) => sub._id == subId);

    if (subTodoIndex === -1) {
      res.status(404).json({
        error: "SubTodo not found",
      });
      return;
    }

    // Update the isComplete property of the subTodo
    todo.subTodo[subTodoIndex].isComplete = subStatus;

    // Save the updated todo
    const updatedTodo = await todo.save();

    // Send the response after the update operation is completed
    res.json({
      msg: "SubTodo Updated Successfully!",
      todo: updatedTodo,
    });
  } catch (error) {
    // Handle errors
    next(error);
  }
};

// Update Todo
const updateTodo = async (req, res, next) => {
  try {
    const { title, isComplete, description, subTodo } = req.body;
    const { todoId } = req.params;

    // Assuming req.user contains the user ID
    const userId = req.user;

    // Check if the user has permission to update the todo
    const todo = await Todo.findOne({ _id: todoId, user: userId }).populate(
      "user",
      "_id name email phoneNumber isAdmin"
    ); // Populate the user field with specified fields

    if (!todo) {
      res.status(404);
      throw new Error(
        "Todo not found or you don't have permission to update it"
      );
    }

    // Update the todo fields
    todo.title = title || todo.title;
    todo.isComplete = isComplete !== undefined ? isComplete : todo.isComplete;
    todo.description = description || todo.description;

    // Update subTodo if provided
    if (subTodo) {
      subTodo.forEach((updatedSubTodo) => {
        // Check if todo.subTodo is an array before trying to find the existing subTodo
        if (Array.isArray(todo.subTodo)) {
          const existingSubTodoIndex = todo.subTodo.findIndex(
            (sub) =>
              sub &&
              sub._id &&
              updatedSubTodo &&
              updatedSubTodo._id &&
              sub._id.toString() === updatedSubTodo._id.toString()
          );

          if (existingSubTodoIndex !== -1) {
            // Update individual subTodo element
            todo.subTodo[existingSubTodoIndex] = {
              ...todo.subTodo[existingSubTodoIndex],
              ...updatedSubTodo,
            };
          } else {
            // Add new subTodo if not found
            todo.subTodo.push(updatedSubTodo);
          }
        } else {
          // If todo.subTodo is not an array, create a new array with the new subTodo
          todo.subTodo = [updatedSubTodo];
        }
      });
    }

    // Save the updated todo
    const updatedTodo = await todo.save();

    return res.json({
      msg: "Todo Updated Successfully!",
      todo: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Todo
const deleteTodo = async (req, res, next) => {
  try {
    const { todoId, subTodoId } = req.params;

    // Assuming req.user contains the user ID
    const userId = req.user;

    // Check if the user has permission to delete the todo
    const todo = await Todo.findOne({ _id: todoId, user: userId });

    if (!todo) {
      res.status(404);
      throw new Error(
        "Todo not found or you don't have permission to delete it"
      );
    }

    // If subTodoId is provided, delete the specific subTodo
    if (subTodoId) {
      todo.subTodo = todo.subTodo.filter(
        (subTodo) => subTodo._id.toString() !== subTodoId
      );
    } else {
      // Delete the entire todo
      await Todo.deleteOne({ _id: todoId, user: userId });
      return res.json({ msg: "Todo Deleted Successfully!" });
    }

    // Save the todo with the updated subTodo array
    await todo.save();

    return res.json({
      msg: "SubTodo Deleted Successfully!",
      todo,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTodo,
  getAllTodo,
  getSingleTodo,
  updateSubTodoStatus,
  updateTodo,
  deleteTodo,
};
