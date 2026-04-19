import { Request, Response, Router } from "express";
import CategoryService from "./category.service";
import { validateDTO } from "../../middleware/validateDTO";
import { CreateCategoryDTO } from "./dto/createCategory.dto";

export default class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly app: Router
  ) {}

  activateRoutes = (): void => {
    /**
     * @route   POST /category
     * @desc    Create a new category
     * @access  Public
     */
    this.app.post(
      "/",
      validateDTO(CreateCategoryDTO),
      async (req: Request, res: Response) => {
        try {
          const category = await this.categoryService.createCategory(req.body);
          res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create category";
          res.status(400).json({ success: false, message });
        }
      }
    );

    /**
     * @route   GET /category
     * @desc    Get all categories
     * @access  Public
     */
    this.app.get("/", async (_req: Request, res: Response) => {
      try {
        const categories = await this.categoryService.getCategories();
        res.status(200).json({
          success: true,
          message: "Categories retrieved successfully",
          count: categories.length,
          data: categories,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to retrieve categories";
        res.status(500).json({ success: false, message });
      }
    });

    /**
     * @route   GET /category/:id
     * @desc    Get a single category by ID
     * @access  Public
     */
    this.app.get("/:id", async (req: Request, res: Response) => {
      try {
        const category = await this.categoryService.getCategoryById(
          req.params.id as string
        );
        res.status(200).json({
          success: true,
          message: "Category retrieved successfully",
          data: category,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Category not found";
        res.status(404).json({ success: false, message });
      }
    });
  };
}
