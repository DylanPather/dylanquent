import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useForm } from '@inertiajs/react';
import * as React from 'react';

export interface EditableProduct {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price_cents: number;
    stock_quantity: number;
    is_active: boolean;
}

interface ProductSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** null = create a new product. */
    product: EditableProduct | null;
}

/** Quick create/edit panel. Full editing lives on the dedicated edit page. */
export function ProductSheet({ open, onOpenChange, product }: ProductSheetProps) {
    // Typed explicitly: `true` would otherwise narrow to the literal type.
    const form = useForm<{
        name: string;
        slug: string;
        sku: string;
        price: string | number;
        stock_quantity: string | number;
        is_active: boolean;
    }>({
        name: '',
        slug: '',
        sku: '',
        price: '',
        stock_quantity: 0,
        is_active: true,
    });

    // Load the row being edited whenever the sheet opens.
    React.useEffect(() => {
        if (!open) return;
        if (product) {
            form.setData({
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                price: product.price_cents / 100,
                stock_quantity: product.stock_quantity,
                is_active: product.is_active,
            });
        } else {
            form.reset();
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, product?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => onOpenChange(false) };

        product
            ? form.put(route('products.update', product.id), options)
            : form.post(route('products.store'), options);
    };

    const field = (key: keyof typeof form.data, label: string, props: React.ComponentProps<typeof Input> = {}) => (
        <div className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
                id={key}
                value={form.data[key] as string | number}
                onChange={(e) => form.setData(key, e.target.value as never)}
                aria-invalid={!!form.errors[key]}
                {...props}
            />
            {form.errors[key] && <p className="text-sm text-destructive">{form.errors[key]}</p>}
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{product ? 'Edit product' : 'New product'}</SheetTitle>
                    <SheetDescription>
                        {product ? 'Update the essentials. Full details live on the product page.' : 'Add a product to your catalog.'}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={submit} className="space-y-4 px-4 pb-4">
                    {field('name', 'Name', { placeholder: 'Boxy Tee', required: true })}
                    {field('sku', 'SKU', { placeholder: 'DQ-TEE-01', required: true })}
                    {field('slug', 'Slug', { placeholder: 'boxy-tee' })}
                    <div className="grid grid-cols-2 gap-3">
                        {field('price', 'Price (R)', { type: 'number', step: '0.01', min: '0', required: true })}
                        {field('stock_quantity', 'Stock', { type: 'number', min: '0' })}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Checkbox
                            id="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(v) => form.setData('is_active', v === true)}
                        />
                        <Label htmlFor="is_active" className="font-normal">
                            Visible in the storefront
                        </Label>
                    </div>

                    <SheetFooter className="flex-row gap-2 px-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing} className="flex-1">
                            {form.processing ? 'Saving…' : product ? 'Save changes' : 'Create product'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
