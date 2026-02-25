declare module "*.css";
declare module "*.scss";
declare module "*.sass";
declare module "*.module.css";
declare module "*.module.scss";
declare module "*.module.sass";

// Allow importing CSS as side-effect (global) in Next.js root layout
declare const __CSS_MODULES__: Record<string, string>;
