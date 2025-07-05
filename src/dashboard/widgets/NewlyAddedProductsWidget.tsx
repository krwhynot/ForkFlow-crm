import React from 'react';
import { Card, Title, Text, Badge } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { CubeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const NewlyAddedProductsWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: products, isLoading } = useGetList('products', {
    pagination: { page: 1, perPage: 5 },
    sort: { field: 'created_at', order: 'DESC' },
    filter: {
      created_by: identity?.id
    }
  });

  if (isLoading) {
    return (
      <Card className="h-80">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border border-gray-200 rounded">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-80 overflow-hidden">
      <Title className="mb-4">Recently Added Products</Title>
      
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '220px' }}>
        {products?.map((product) => (
          <div key={product.id} className="p-3 border border-gray-200 rounded hover:border-tremor-brand transition-colors">
            <div className="flex items-start justify-between mb-2">
              <Text className="font-medium text-tremor-content-strong text-sm line-clamp-1">
                {product.name}
              </Text>
              <CubeIcon className="w-4 h-4 text-tremor-brand flex-shrink-0 ml-2" />
            </div>
            
            <div className="space-y-1">
              {product.category && (
                <Badge className="text-xs" color="blue">
                  {product.category}
                </Badge>
              )}
              
              <Text className="text-xs text-tremor-content">
                Added {format(new Date(product.created_at), 'MMM d, yyyy')}
              </Text>
              
              {product.principal && (
                <Text className="text-xs text-tremor-content">
                  Principal: {product.principal}
                </Text>
              )}
            </div>
          </div>
        ))}
        
        {!products?.length && (
          <div className="text-center py-8">
            <CubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <Text className="text-tremor-content">No recent products</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export const NewlyAddedProductsWidget = React.memo(NewlyAddedProductsWidgetComponent);