import * as React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { useRecordContext } from 'react-admin';
import { Product } from '../types';

interface PriceFieldProps extends Omit<TypographyProps, 'children'> {
    source?: keyof Product;
    currency?: string;
    locale?: string;
    showCurrency?: boolean;
    variant?: TypographyProps['variant'];
    color?: TypographyProps['color'];
    record?: Product;
    label?: string;
}

export const PriceField: React.FC<PriceFieldProps> = ({
    source = 'price',
    currency = 'USD',
    locale = 'en-US',
    showCurrency = true,
    variant = 'body1',
    color = 'success.main',
    record: passedRecord,
    sx,
    ...props
}) => {
    const contextRecord = useRecordContext<Product>();
    const record = passedRecord || contextRecord;

    if (!record || record[source] === undefined || record[source] === null) {
        return (
            <Typography
                variant={variant}
                color="text.secondary"
                sx={sx}
                {...props}
            >
                —
            </Typography>
        );
    }

    const priceValue = record[source];
    const price =
        typeof priceValue === 'number' ? priceValue : Number(priceValue);

    if (isNaN(price)) {
        return (
            <Typography variant={variant} color="error" sx={sx} {...props}>
                Invalid price
            </Typography>
        );
    }

    const formattedPrice = showCurrency
        ? new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }).format(price)
        : new Intl.NumberFormat(locale, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }).format(price);

    return (
        <Typography
            variant={variant}
            color={color}
            sx={{
                fontWeight: 500,
                ...sx,
            }}
            {...props}
        >
            {formattedPrice}
        </Typography>
    );
};

// Convenience components for different price display variants
export const PriceFieldLarge: React.FC<PriceFieldProps> = props => (
    <PriceField variant="h4" color="primary.main" {...props} />
);

export const PriceFieldMedium: React.FC<PriceFieldProps> = props => (
    <PriceField variant="h6" {...props} />
);

export const PriceFieldSmall: React.FC<PriceFieldProps> = props => (
    <PriceField variant="body2" {...props} />
);

// Utility function for getting formatted price string
export const formatPrice = (
    price: number,
    currency: string = 'USD',
    locale: string = 'en-US'
): string => {
    if (isNaN(price)) return '—';

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};
