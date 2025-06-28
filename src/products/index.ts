import { ProductList } from './ProductList';
import { ProductCreate } from './ProductCreate';
import { ProductEdit } from './ProductEdit';
import { ProductShow } from './ProductShow';

// Default export for resource registration
export default {
    list: ProductList,
    create: ProductCreate,
    edit: ProductEdit,
    show: ProductShow,
};

// Named exports for direct usage
export { ProductList } from './ProductList';
export { ProductCreate } from './ProductCreate';
export { ProductEdit } from './ProductEdit';
export { ProductShow } from './ProductShow';

// Enhanced component exports
export { ProductListFilter } from './ProductListFilter';
export { ProductBulkActions } from './ProductBulkActions';
export { ProductComparison, useProductComparison } from './ProductComparison';
export {
    PriceField,
    PriceFieldLarge,
    PriceFieldMedium,
    PriceFieldSmall,
    formatPrice,
} from './PriceField';
