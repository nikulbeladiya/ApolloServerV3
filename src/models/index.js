import mongoose from "mongoose";
import User from "./user";
import Blog from "./blog";

const connectDB = () => {
  return mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};

const models = {
  User,
  Blog,
};

export { connectDB };
export default models;
