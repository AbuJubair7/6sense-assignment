import { Request, Response, Router } from "express";
import ProductService from "./product.service";

export default class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly app: Router,
  ) {}
  activateRoutes = (): void => {
    this.app.get("/", (req: Request, res: Response) => {
      res.send(this.productService.productGreet());
    });
  };
}
