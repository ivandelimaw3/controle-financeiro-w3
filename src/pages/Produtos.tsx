
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Package, Loader2 } from 'lucide-react';
import { ProductsTable } from '@/components/Products/ProductsTable';
import { ProductModal } from '@/components/Products/ProductModal';
import { useProductsData, Product } from '@/hooks/useProductsData';

const Produtos: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  
  const {
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    isAddingProduct,
    isUpdatingProduct
  } = useProductsData();

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(undefined);
  };

  const handleSubmit = (data: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingProduct) {
      updateProduct({ id: editingProduct.id, ...data });
    } else {
      addProduct(data);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
              <p className="text-slate-600">Gerencie os produtos da assistência técnica</p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-slate-900">{products.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {products.length > 0 ? (
          <ProductsTable
            products={products}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Package size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-slate-600 mb-4">Comece adicionando seu primeiro produto.</p>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus size={20} className="mr-2" />
              Adicionar Produto
            </Button>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
        onSubmit={handleSubmit}
        isLoading={isAddingProduct || isUpdatingProduct}
      />
    </Layout>
  );
};

export default Produtos;
