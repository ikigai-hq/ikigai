import { ComboBoxItem } from "./Time";

export enum CurrencyUnit {
  USD = "USD",
  VND = "VND",
}

export const currencyOptions: ComboBoxItem[] = [
  { value: CurrencyUnit.USD, name: "USD" },
  { value: CurrencyUnit.VND, name: "VND" },
];

export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string = "vi"
) => {
  let countryFormat = "en-us";
  if (locale === "vi") {
    countryFormat = "vi";
  }
  return new Intl.NumberFormat(countryFormat, {
    style: "currency",
    currency,
  }).format(amount);
};
