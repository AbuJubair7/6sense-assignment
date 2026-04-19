import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDTO {
  @IsNotEmpty({ message: "Category name is required" })
  @IsString({ message: "Category name must be a string" })
  name!: string;

  @IsOptional()
  @IsString({ message: "Description must be a string" })
  description?: string;
}
