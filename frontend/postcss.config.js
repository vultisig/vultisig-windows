import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";

import tailwindConfig from "./tailwind.config.js";

export const plugins = [tailwind(tailwindConfig), autoprefixer];
