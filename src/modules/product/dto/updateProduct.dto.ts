import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { ProductStatus } from "./createProduct.dto";

export class UpdateProductDTO {
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: "Status must be either 'In Stock' or 'Stock Out'",
  })
  status?: ProductStatus;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: "Discount must be a number" })
  @Min(0, { message: "Discount must be between 0 and 100" })
  @Max(100, { message: "Discount must be between 0 and 100" })
  discount?: number;
}
