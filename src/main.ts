import express from "express";
import ProductService from "./modules/product/product.service";
import ProductController from "./modules/product/product.controller";
import CategoryService from "./modules/category/category.service";
import CategoryController from "./modules/category/category.controller";

// declare routes here
export const routes = {
  "/product": express.Router(),
  "/category": express.Router(),
};

// declare services here
export const services = {
  productService: new ProductService(),
  categoryService: new CategoryService(),
};

// declare controllers here
export const controllers = {
  productController: new ProductController(
    services.productService,
    routes["/product"]!,
  ),
  categoryController: new CategoryController(
    services.categoryService,
    routes["/category"]!,
  ),
};
