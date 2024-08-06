import type Stripe from "stripe";
import { useOptimistic, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import type * as Commerce from "commerce-kit";
import { RadioGroup, RadioGroupItem } from "@/ui/shadcn/radio-group";
import { cn, formatMoney } from "@/lib/utils";

export const ShippingRatesSection = ({
	shippingRates,
	value,
	onChange,
}: {
	shippingRates: Commerce.ShippingRate[];
	value: string | null | undefined;
	onChange: (value: string) => void;
}) => {
	const [isTransitioning, transition] = useTransition();
	const [optimisticValue, setOptimisticValue] = useOptimistic(value);
	const isPending = isTransitioning || optimisticValue !== value;
	const locale = useLocale();

	return (
		<fieldset className={cn(`grid gap-6 rounded-lg`, isPending && "cursor-wait")}>
			<legend className="mb-2 whitespace-nowrap text-sm font-medium">Shipping method</legend>
			<RadioGroup
				className="grid max-w-md gap-4 xs:grid-cols-3"
				value={optimisticValue ?? undefined}
				onValueChange={(newValue) => {
					transition(() => {
						setOptimisticValue(newValue);
						return onChange(newValue);
					});
				}}
			>
				{shippingRates.map((rate) => (
					<label
						key={rate.id}
						className={cn(
							"grid content-end items-end rounded-md border-2 border-muted px-2 py-2 transition-colors",
							`has-[[aria-checked="true"]]:border-foreground/60`,
							isPending ? "cursor-wait" : "cursor-pointer hover:bg-neutral-50",
						)}
					>
						<RadioGroupItem value={rate.id} className="sr-only" />
						<p className="text-sm font-medium">{rate.display_name}</p>
						{rate.delivery_estimate && (
							<p className="text-xs text-muted-foreground">
								<FormatDeliveryEstimate estimate={rate.delivery_estimate} />
							</p>
						)}
						{rate.fixed_amount && (
							<p className="mt-0.5">
								{formatMoney({
									amount: rate.fixed_amount.amount,
									currency: rate.fixed_amount.currency,
									locale,
								})}
							</p>
						)}
					</label>
				))}
			</RadioGroup>
		</fieldset>
	);
};

export const FormatDeliveryEstimate = ({
	estimate,
}: {
	estimate: Commerce.ShippingRate["delivery_estimate"];
}) => {
	const t = useTranslations("Global.deliveryEstimates");
	if (!estimate?.minimum && !estimate?.maximum) {
		return null;
	}

	if (estimate.minimum && !estimate.maximum) {
		return `${t("atLeast")} ${deliveryUnitToText(estimate.minimum.value, estimate.minimum.unit, t)}`;
	}
	if (!estimate.minimum && estimate.maximum) {
		return `${t("upTo")} ${deliveryUnitToText(estimate.maximum.value, estimate.maximum.unit, t)}`;
	}
	if (estimate.minimum && estimate.maximum) {
		if (estimate.minimum.value === estimate.maximum.value) {
			return deliveryUnitToText(estimate.minimum.value, estimate.minimum.unit, t);
		}
		if (estimate.minimum.unit === estimate.maximum.unit) {
			return `${estimate.minimum.value}–${deliveryUnitToText(estimate.maximum.value, estimate.maximum.unit, t)}`;
		}
		return `${deliveryUnitToText(estimate.minimum.value, estimate.minimum.unit, t)} – ${deliveryUnitToText(estimate.maximum.value, estimate.maximum.unit, t)}`;
	}
	return null;
};

type i18n = ReturnType<typeof useTranslations<"Global.deliveryEstimates">>;
const deliveryUnitToText = (
	value: number,
	unit:
		| Stripe.ShippingRate.DeliveryEstimate.Maximum.Unit
		| Stripe.ShippingRate.DeliveryEstimate.Minimum.Unit,
	t: i18n,
) => {
	switch (unit) {
		case "business_day":
			return t("businessDay", { count: value });
		default:
			return t(unit, { count: value });
	}
};
