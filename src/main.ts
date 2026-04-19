import express from "express";
import ProductService from "./modules/product/product.service";
import ProductController from "./modules/product/product.controller";

// decalre routes here
export const routes = {
  "/product": express.Router(),
};
// declare services here
export const services = {
  productService: new ProductService(),
};
// declare controllers here
export const controllers = {
  productController: new ProductController(
    services.productService,
    routes["/product"],
  ),
};
