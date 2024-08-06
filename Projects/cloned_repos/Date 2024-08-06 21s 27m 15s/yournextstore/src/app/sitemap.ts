import { type MetadataRoute } from "next";
import * as Commerce from "commerce-kit";
import { env } from "@/env.mjs";
import { Categories } from "@/ui/nav/Nav";

type Item = MetadataRoute.Sitemap[number];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = env.NEXT_PUBLIC_URL;

	const products = await Commerce.productBrowse({ first: 100 });
	const productUrls = products.map(
		(product) =>
			({
				url: `${base}/product/${product.metadata.slug}`,
				lastModified: new Date(product.updated * 1000),
				changeFrequency: "daily",
				priority: 0.8,
			}) satisfies Item,
	);

	const categoryUrls = Categories.map(
		(category) =>
			({
				url: `${base}/category/${category.slug}`,
				lastModified: new Date(),
				changeFrequency: "daily",
				priority: 0.5,
			}) satisfies Item,
	);

	return [
		{
			url: base,
			lastModified: new Date(),
			changeFrequency: "always",
			priority: 1,
		},
		...productUrls,
		...categoryUrls,
	];
}
