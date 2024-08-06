import { Suspense } from "react";
import { ShoppingBagIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { calculateCartTotalNetWithoutShipping } from "commerce-kit";
import { getCartFromCookiesAction } from "@/actions/cartActions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/shadcn/tooltip";
import { YnsLink } from "@/ui/YnsLink";
import { formatMoney } from "@/lib/utils";

const CartFallback = () => (
	<div className="mr-2.5 h-6 w-6 opacity-30">
		<ShoppingBagIcon />
	</div>
);

export const CartSummaryNav = () => {
	return (
		<Suspense fallback={<CartFallback />}>
			<CartSummaryNavInner />
		</Suspense>
	);
};

const CartSummaryNavInner = async () => {
	const cart = await getCartFromCookiesAction();
	if (!cart) {
		return <CartFallback />;
	}
	if (!cart.lines.length) {
		return <CartFallback />;
	}

	const total = calculateCartTotalNetWithoutShipping(cart);
	const totalItems = cart.lines.reduce((acc, line) => acc + line.quantity, 0);
	const t = await getTranslations("Global.nav.cartSummary");
	const locale = await getLocale();

	return (
		<TooltipProvider>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>
					<div>
						<YnsLink
							href="/cart-overlay"
							scroll={false}
							className="relative mr-2.5 block h-6 w-6"
							prefetch={true}
						>
							<ShoppingBagIcon />
							<span className="absolute bottom-0 right-0 inline-flex h-5 w-5 translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full border-2 bg-white text-center text-xs">
								<span className="sr-only">{t("itemsInCart")}: </span>
								{totalItems}
							</span>
							<span className="sr-only">
								{t("total")}:{" "}
								{formatMoney({
									amount: total,
									currency: cart.cart.currency,
									locale,
								})}
							</span>
						</YnsLink>
					</div>
				</TooltipTrigger>
				<TooltipContent side="left" sideOffset={25}>
					<p>{t("totalItems", { count: totalItems })}</p>
					<p>
						{t("total")}: {formatMoney({ amount: total, currency: cart.cart.currency, locale })}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
