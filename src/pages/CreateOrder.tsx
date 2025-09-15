import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Plus, Trash2 } from 'lucide-react';
import api from '../api/apiClient';
import Header from '../components/Header';
import Button from '../components/Button';
import { toast } from '@/hooks/use-toast';

interface Customer {
  _id: string;
  name?: string;
  email: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    orderId: '',
    items: [{ productId: '', quantity: 1, price: 0 }] as OrderItem[]
  });

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await api.get('/customers');
        setCustomers(response.data || []);
      } catch (error) {
        console.error('Failed to load customers:', error);
      }
    }
    loadCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customerId: formData.customerId,
        orderId: formData.orderId || undefined,
        items: formData.items.filter(item => item.productId && item.quantity > 0),
        // totalAmount: formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        orderDate: new Date().toISOString()
      };

      if (orderData.items.length === 0) {
        toast({
          title: "No items added",
          description: "Please add at least one item to the order.",
          variant: "destructive",
        });
        return;
      }

      const response = await api.post('/orders', orderData);
      
      toast({
        title: "Order created successfully",
        description: `Order ${orderData.orderId || 'created'} has been added.`,
      });

      navigate(`/orders/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast({
        title: "Failed to create order",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header 
        title="Create Order" 
        subtitle="Add a new order to the system"
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </Header>

      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Information */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Order Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className="form-input"
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name || customer.email} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Auto-generated if empty"
                  value={formData.orderId}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Order Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addItem}
              >
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="p-4 bg-surface rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="form-label">Product ID</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter product ID"
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="form-label">Unit Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-input"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        Total: ${(item.quantity * item.price).toFixed(2)}
                      </div>
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="gradient"
              icon={Save}
              loading={loading}
              disabled={!formData.customerId || formData.items.some(item => !item.productId)}
            >
              Create Order
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/orders')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

