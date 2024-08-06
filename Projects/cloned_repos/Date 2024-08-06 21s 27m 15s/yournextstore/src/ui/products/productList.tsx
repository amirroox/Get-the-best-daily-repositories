import Image from "next/image";
import { getLocale } from "next-intl/server";
import type * as Commerce from "commerce-kit";
import { JsonLd, mappedProductsToJsonLd } from "@/ui/JsonLd";
import { YnsLink } from "@/ui/YnsLink";
import { formatMoney } from "@/lib/utils";

export const ProductList = async ({ products }: { products: Commerce.MappedProduct[] }) => {
	const locale = await getLocale();

	return (
		<>
			<ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((product, idx) => {
					return (
						<li key={product.id} className="group">
							<YnsLink href={`/product/${product.metadata.slug}`}>
								<article className="overflow-hidden rounded border bg-white">
									{product.images[0] && (
										<div className="aspect-square w-full overflow-hidden bg-neutral-100">
											<Image
												className="group-hover:rotate hover-perspective w-full bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-75"
												src={product.images[0]}
												width={768}
												height={768}
												loading={idx < 3 ? "eager" : "lazy"}
												priority={idx < 3}
												alt=""
											/>
										</div>
									)}
									<div className="p-4">
										<h2 className="text-lg font-semibold text-neutral-700">{product.name}</h2>
										<footer className="text-sm font-medium text-neutral-900">
											{product.default_price.unit_amount && (
												<p>
													{formatMoney({
														amount: product.default_price.unit_amount,
														currency: product.default_price.currency,
														locale,
													})}
												</p>
											)}
										</footer>
									</div>
								</article>
							</YnsLink>
						</li>
					);
				})}
			</ul>
			<JsonLd jsonLd={mappedProductsToJsonLd(products)} />
		</>
	);
};
