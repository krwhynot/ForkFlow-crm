import React from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
}

interface ProductsGridProps {
  products: Product[];
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Newly Added Products
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 mx-auto object-contain"
              />
            </div>
            <p className="text-sm font-medium text-gray-900">
              {product.name}
            </p>
            <p className="text-xs text-gray-500">{product.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
};