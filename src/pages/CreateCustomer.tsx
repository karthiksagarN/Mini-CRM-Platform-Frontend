import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, DollarSign, Upload } from 'lucide-react';
import Papa from 'papaparse';
import api from '../api/apiClient';
import Header from '../components/Header';
import Button from '../components/Button';
import { toast } from '@/hooks/use-toast';

export default function CreateCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- State for manual entry ---
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    totalSpending: ''
  });

  // --- State for CSV import ---
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // --- Manual form submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customerData = {
        name: formData.name || undefined,
        email: formData.email,
        attributes: {
          spend: parseFloat(formData.totalSpending) || 0
        }
      };

      const response = await api.post('/customers', customerData);

      toast({
        title: "Customer created successfully",
        description: `${formData.name || formData.email} has been added to your customer list.`,
      });

      navigate(`/customers/${response.data._id}`);
    } catch (error: any) {
      console.error('Failed to create customer:', error);
      toast({
        title: "Failed to create customer",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- CSV Import ---
  const handleCSVUpload = async () => {
    if (!csvFile) return;

    setLoading(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const customerPayloads = results.data.map((row: any) => {
          // Ensure email exists, as it's required by the schema
          if (!row.email) {
            return null;
          }
          
          // Parse tags from a string like "tag1, tag2; tag3" into an array
          const tags = row.tags
            ? row.tags.split(/[;,]+/).map((t: string) => t.trim()).filter(Boolean)
            : [];

          // Construct the customer object according to your Mongoose schema
          return {
            email: row.email.trim(),
            name: row.name || undefined,
            attributes: {
              spend: row.spend ? parseFloat(row.spend) : 0,
              visits: row.visits ? parseInt(row.visits, 10) : 0,
              country: row.country || undefined,
              tags: tags,
              lastVisit: row.lastVisit || undefined,
              // You can add any other custom attributes here
              preferredCategory: row.preferredCategory || undefined,
              age: row.age ? parseInt(row.age, 10) : undefined,
              gender: row.gender || undefined,
            }
          };
        }).filter(Boolean); // Filter out any rows that were missing an email

        if (customerPayloads.length === 0) {
          toast({
            title: 'Import Failed',
            description: 'No valid customer data with emails found in the CSV file.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        try {
          // Create an array of API request promises
          const importPromises = customerPayloads.map(customer => 
            api.post('/customers', customer)
          );

          // Use Promise.all to execute all requests concurrently
          await Promise.all(importPromises);

          toast({
            title: 'Customers imported successfully',
            description: `${customerPayloads.length} customers have been added.`,
          });

          navigate('/customers');
        } catch (error: any) {
          console.error('CSV import failed:', error);
          toast({
            title: 'Import failed',
            description: error.response?.data?.message || 'An error occurred while importing customers. Some may have failed.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <Header
        title="Create or Import Customers"
        subtitle="Add a single customer manually or import multiple from a CSV file"
      >
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </Button>
      </Header>

      <div className="max-w-2xl space-y-10">
        {/* --- Manual Customer Form --- */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Add Single Customer</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter customer name (optional)"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  className="form-input pl-10"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Total Spending</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input pl-10"
                  placeholder="0.00"
                  value={formData.totalSpending}
                  onChange={(e) => handleInputChange('totalSpending', e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter the customer's historical spending amount
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="gradient"
                icon={Save}
                loading={loading}
                disabled={!formData.email}
              >
                Create Customer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/customers')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

         {/* --- CSV Import Section --- */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Import Customers from CSV</h3>
          </div>

          {/* Hidden file input */}
          <input
            id="csvFileInput"
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            style={{ display: "none" }}
          />

          {/* Custom trigger button */}
          <Button
            type="button"
            variant="outline"
            icon={Upload}
            onClick={() => document.getElementById("csvFileInput")?.click()}
          >
            {csvFile ? `Selected: ${csvFile.name}` : "Choose CSV File"}
          </Button>

          <Button
            type="button"
            variant="gradient"
            icon={Upload}
            loading={loading}
            disabled={!csvFile}
            onClick={handleCSVUpload}
          >
            Import CSV
          </Button>

          <p className="text-xs text-muted-foreground mt-2">
            CSV must include columns: <strong>email</strong>, optional: name, spend, visits, country, tags (semicolon separated), lastVisit, preferredCategory, age, gender
          </p>
        </div>


      </div>
    </div>
  );
}
