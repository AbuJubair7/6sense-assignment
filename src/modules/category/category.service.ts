import { CreateCategoryDTO } from "./dto/createCategory.dto";
import CategoryModel, { ICategory } from "./category.model";

export interface CategoryResponse {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const toResponse = (category: ICategory): CategoryResponse => ({
  _id: category._id.toString(),
  name: category.name,
  ...(category.description !== undefined && {
    description: category.description,
  }),
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

export default class CategoryService {
  constructor() {}

  /**
   * Create a new category.
   */
  createCategory = async (dto: CreateCategoryDTO): Promise<CategoryResponse> => {
    const existing = await CategoryModel.findOne({ name: dto.name });
    if (existing) {
      throw new Error(`Category with name "${dto.name}" already exists`);
    }

    const category = await CategoryModel.create({
      name: dto.name,
      ...(dto.description !== undefined && { description: dto.description }),
    });

    return toResponse(category);
  };

  /**
   * Get all categories.
   */
  getCategories = async (): Promise<CategoryResponse[]> => {
    const categories = await CategoryModel.find().lean();
    return categories.map((c) => ({
      _id: c._id.toString(),
      name: c.name,
      ...(c.description !== undefined && { description: c.description }),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  };

  /**
   * Get a single category by ID.
   */
  getCategoryById = async (id: string): Promise<CategoryResponse> => {
    const category = await CategoryModel.findById(id);
    if (!category) {
      throw new Error(`Category with id "${id}" not found`);
    }
    return toResponse(category);
  };
}
