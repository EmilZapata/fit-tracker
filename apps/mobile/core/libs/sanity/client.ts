import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

// Import using ESM URL imports in environments that supports it:
// import {createClient} from 'https://esm.sh/@sanity/client'

//Client safe config
export const config = {
  projectId: "v90mk1xr",
  dataset: "fit-tracker-dataset",
  apiVersion: "2024-01-01",
  useCdn: false,
};

export const client = createClient(config);

//Admin level client, used for backend
//Admin client for mutations
const adminConfig = {
  ...config,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
};

export const adminClient = createClient(adminConfig);

//Image URL builder
export const imageUrlBuilder = createImageUrlBuilder(config);

export const urlForImage = (source: string) => imageUrlBuilder.image(source);
