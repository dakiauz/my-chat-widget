import currencySymbolMap from 'currency-symbol-map';
import currencyCodes from 'currency-codes';

export const getCurrencyDetails = (country: string) => {
    const currencyCode = currencyCodes.country(country)?.[0]?.code;
    if (!currencyCode) return null;

    return {
        currency: currencyCode,
        currencySymbol: currencySymbolMap(currencyCode) || 'N/A',
        currencyName: currencyCodes.code(currencyCode)?.currency || 'N/A',
    };
};

export const getAllCurrencies = () => {
    return currencyCodes.data.map(({ code, currency }) => ({
        currencyCode: code,
        currencyName: currency,
        currencySymbol: currencySymbolMap(code) || 'N/A',
    }));
};
