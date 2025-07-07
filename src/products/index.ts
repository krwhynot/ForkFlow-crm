import { ProductList } from './ProductList';
import { ProductCreate } from './ProductCreate';
import { ProductEdit } from './ProductEdit';
import { ProductShow } from './ProductShow';

// Import the new placeholder ProductPage
import { ProductPage } from '../components/products';

// Default export for resource registration
export default {
    list: ProductPage, // Use the new placeholder page
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
export {
    ProductListFilter,
    ProductNameFilter,
    ProductSKUFilter,
    ProductCategoryFilter,
    ProductPrincipalFilter,
    ProductActiveFilter,
    getProductFilters,
} from './ProductListFilter';
export { ProductBulkActions } from './ProductBulkActions';
export { ProductComparison, useProductComparison } from './ProductComparison';
export {
    PriceField,
    PriceFieldLarge,
    PriceFieldMedium,
    PriceFieldSmall,
    formatPrice,
} from './PriceField';
