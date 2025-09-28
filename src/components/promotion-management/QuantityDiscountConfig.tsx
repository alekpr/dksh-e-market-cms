import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface QuantityDiscountTier {
  minQuantity: number;
  discountAmount: number;
  maxDiscount?: number;
}

interface QuantityDiscountConfigProps {
  tiers: QuantityDiscountTier[];
  onChange: (tiers: QuantityDiscountTier[]) => void;
}

export function QuantityDiscountConfig({ tiers, onChange }: QuantityDiscountConfigProps) {
  const addTier = () => {
    const newTiers = [...tiers, { minQuantity: 1, discountAmount: 0 }];
    onChange(newTiers);
  };

  const removeTier = (index: number) => {
    const newTiers = tiers.filter((_, i) => i !== index);
    onChange(newTiers);
  };

  const updateTier = (index: number, field: keyof QuantityDiscountTier, value: number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onChange(newTiers);
  };

  const sortedTiers = [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quantity Discount Tiers</span>
          <Button type="button" onClick={addTier} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tier
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tiers.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No discount tiers configured.</p>
            <p className="text-sm">Click "Add Tier" to create your first discount tier.</p>
          </div>
        )}
        
        {tiers.map((tier, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Tier {index + 1}</h4>
                {tiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`minQuantity-${index}`}>Minimum Quantity *</Label>
                  <Input
                    id={`minQuantity-${index}`}
                    type="number"
                    min="1"
                    value={tier.minQuantity}
                    onChange={(e) => updateTier(index, 'minQuantity', parseInt(e.target.value) || 1)}
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Min items to qualify</p>
                </div>
                
                <div>
                  <Label htmlFor={`discountAmount-${index}`}>Discount Amount (฿) *</Label>
                  <Input
                    id={`discountAmount-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={tier.discountAmount}
                    onChange={(e) => updateTier(index, 'discountAmount', parseFloat(e.target.value) || 0)}
                    placeholder="100.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Fixed discount in baht</p>
                </div>
                
                <div>
                  <Label htmlFor={`maxDiscount-${index}`}>Max Discount (฿)</Label>
                  <Input
                    id={`maxDiscount-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={tier.maxDiscount || ''}
                    onChange={(e) => updateTier(index, 'maxDiscount', parseFloat(e.target.value) || 0)}
                    placeholder="500.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional limit</p>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Rule:</strong> Buy {tier.minQuantity}+ items → Get ฿{tier.discountAmount} discount
                  {tier.maxDiscount && ` (max ฿${tier.maxDiscount})`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sortedTiers.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Discount Preview</h4>
            <div className="space-y-1">
              {sortedTiers.map((tier, index) => (
                <p key={index} className="text-sm text-green-700">
                  • Buy {tier.minQuantity}+ items → Get ฿{tier.discountAmount} discount
                  {tier.maxDiscount && ` (max ฿${tier.maxDiscount})`}
                </p>
              ))}
            </div>
            <p className="text-xs text-green-600 mt-2">
              Customer automatically gets the highest qualifying tier discount.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}