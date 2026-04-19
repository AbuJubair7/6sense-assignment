import mongoose, { Document, Schema, Types } from "mongoose";
import { ProductStatus } from "./dto/createProduct.dto";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  status: ProductStatus;
  productCode: string;
  categoryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      required: true,
    },
    productCode: {
      type: String,
      required: true,
      unique: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
export default ProductModel;
