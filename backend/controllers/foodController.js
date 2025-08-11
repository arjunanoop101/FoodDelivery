import foodModel from "../models/foodModel.js";
import fs from "fs";
import imagekit from "../config/imageKit.js";

// all food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// add food
const addFood = async (req, res) => {
  try {
    // let image_filename = `${req.file.filename}`
    const imageFile = req.file;
    const fileBuffer = fs.readFileSync(imageFile.path); //convert image to buffer
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/food",
    });
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" }, // autocompress
        { format: "webp" }, //convert to modern format
        { width: "1280" }, //resize
      ],
    });
    const image = optimizedImageUrl;
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image,
      imageFieldId: response.fileId,
    });

    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// delete food
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    // fs.unlink(`uploads/${food.image}`, () => {});

    if (food.imageFieldId) {
      await imagekit.deleteFile(food.imageFieldId);
    }

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { listFood, addFood, removeFood };
