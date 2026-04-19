import { CreateProductDTO } from "./dto/createProduct.dto";
import { UpdateProductDTO } from "./dto/updateProduct.dto";
import { IProduct } from "./product.model";
import ProductModel from "./product.model";
import CategoryModel from "../category/category.model";
import { generateProductCode } from "../../helpers/productCodeGenerator";
import { calculateFinalPrice } from "../../helpers/calculateFinalPrice";

export interface GetProductsQuery {
  categoryId?: string;
  name?: string;
}

export interface ProductResponse {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  finalPrice: number;
  image: string;
  status: string;
  productCode: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

const toResponse = (product: IProduct): ProductResponse => {
  return {
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    discount: product.discount,
    finalPrice: calculateFinalPrice(product.price, product.discount),
    image: product.image,
    status: product.status,
    productCode: product.productCode,
    categoryId: product.categoryId.toString(),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export default class ProductService {
  constructor() {}

  /**
   * Create a new product with an auto-generated product code.
   */
  createProduct = async (dto: CreateProductDTO): Promise<ProductResponse> => {
    // Validate that the category exists in the DB
    const category = await CategoryModel.findById(dto.categoryId);
    if (!category) {
      throw new Error(`Category with id "${dto.categoryId}" does not exist`);
    }

    // Generate a unique product code
    let productCode = generateProductCode(dto.name);
    let attempt = 0;
    while (await ProductModel.exists({ productCode })) {
      attempt++;
      productCode = `${generateProductCode(dto.name)}-${attempt}`;
    }

    const product = await ProductModel.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      discount: dto.discount ?? 0,
      image: dto.image,
      status: dto.status,
      productCode,
      categoryId: dto.categoryId,
    });

    return toResponse(product);
  };

  /**
   * Get all products with optional filters.
   */
  getProducts = async (
    query: GetProductsQuery
  ): Promise<ProductResponse[]> => {
    const filter: Record<string, unknown> = {};

    // Filter by category
    if (query.categoryId) {
      filter["categoryId"] = query.categoryId;
    }

    // Search by name — partial, case-insensitive
    if (query.name) {
      filter["name"] = { $regex: query.name, $options: "i" };
    }

    const products = await ProductModel.find(filter).lean();

    // Pricing calculation included in response
    return products.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      discount: p.discount,
      finalPrice: calculateFinalPrice(p.price, p.discount),
      image: p.image,
      status: p.status,
      productCode: p.productCode,
      categoryId: p.categoryId.toString(),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  };

  /**
   * Update allowed product fields: status, description, discount.
   */
  updateProduct = async (
    id: string,
    dto: UpdateProductDTO
  ): Promise<ProductResponse> => {
    const product = await ProductModel.findByIdAndUpdate(
      id,
      {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.discount !== undefined && { discount: dto.discount }),
      },
      { new: true, runValidators: true, returnDocument: "after" }
    );

    if (!product) {
      throw new Error(`Product with id "${id}" not found`);
    }

    return toResponse(product);
  };
}
