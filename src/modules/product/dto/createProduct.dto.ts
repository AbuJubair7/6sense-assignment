import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from "class-validator";

export enum ProductStatus {
  IN_STOCK = "In Stock",
  STOCK_OUT = "Stock Out",
}

export class CreateProductDTO {
  @IsNotEmpty({ message: "Product name is required" })
  @IsString({ message: "Product name must be a string" })
  name!: string;

  @IsNotEmpty({ message: "Description is required" })
  @IsString({ message: "Description must be a string" })
  description!: string;

  @IsNotEmpty({ message: "Price is required" })
  @IsNumber({}, { message: "Price must be a number" })
  @Min(0, { message: "Price must be non-negative" })
  price!: number;

  @IsOptional()
  @IsNumber({}, { message: "Discount must be a number" })
  @Min(0, { message: "Discount must be between 0 and 100" })
  @Max(100, { message: "Discount must be between 0 and 100" })
  discount?: number;

  @IsNotEmpty({ message: "Image URL is required" })
  @IsUrl({}, { message: "Image must be a valid URL" })
  image!: string;

  @IsNotEmpty({ message: "Status is required" })
  @IsEnum(ProductStatus, {
    message: "Status must be either 'In Stock' or 'Stock Out'",
  })
  status!: ProductStatus;

  @IsNotEmpty({ message: "Category ID is required" })
  @IsMongoId({ message: "Category ID must be a valid MongoDB ObjectId" })
  categoryId!: string;
}
