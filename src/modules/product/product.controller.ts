import { Request, Response, Router } from "express";
import ProductService from "./product.service";
import { validateDTO } from "../../middleware/validateDTO";
import { CreateProductDTO } from "./dto/createProduct.dto";
import { UpdateProductDTO } from "./dto/updateProduct.dto";

export default class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly app: Router
  ) {}

  activateRoutes = (): void => {
    /**
     * @route   POST /product
     * @desc    Create a new product
     * @access  Public
     */
    this.app.post(
      "/",
      validateDTO(CreateProductDTO),
      async (req: Request, res: Response) => {
        try {
          const product = await this.productService.createProduct(req.body);
          res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Failed to create product";
          res.status(400).json({ success: false, message });
        }
      }
    );

    /**
     * @route   GET /product
     * @desc    Get all products with optional filters
     *          Query params: ?categoryId=<id>&name=<search>
     * @access  Public
     */
    this.app.get("/", async (req: Request, res: Response) => {
      try {
        const { categoryId, name } = req.query as {
          categoryId?: string;
          name?: string;
        };
        const products = await this.productService.getProducts({
          ...(categoryId !== undefined && { categoryId }),
          ...(name !== undefined && { name }),
        });
        res.status(200).json({
          success: true,
          message: "Products retrieved successfully",
          count: products.length,
          data: products,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to retrieve products";
        res.status(500).json({ success: false, message });
      }
    });

    /**
     * @route   PATCH /product/:id
     * @desc    Update product — status, description, discount only
     * @access  Public
     */
    this.app.patch(
      "/:id",
      validateDTO(UpdateProductDTO),
      async (req: Request, res: Response) => {
        try {
          const updated = await this.productService.updateProduct(
            req.params.id as string,
            req.body
          );
          res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updated,
          });
        } catch (error: unknown) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update product";
          const status = message.includes("not found") ? 404 : 400;
          res.status(status).json({ success: false, message });
        }
      }
    );
  };
}
