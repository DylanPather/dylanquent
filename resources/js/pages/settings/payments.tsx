import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertCircle, Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Gateway {
  name: string;
  fields: string[];
  description: string;
}

interface PageProps {
  gateways: Record<string, Gateway>;
  credentials: Record<string, Record<string, string | null>>;
}

export default function PaymentsSettings() {
  const { gateways, credentials } = usePage().props as any as PageProps;
  const [formData, setFormData] = useState(credentials);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleInputChange = (gateway: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    router.put(route('settings.payments.update'), formData, {
      onFinish: () => setSaving(false),
    });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isSecretField = (field: string) => {
    return field.includes('secret') || field.includes('key');
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      public_key: 'Public Key',
      secret_key: 'Secret Key',
      client_id: 'Client ID',
      client_secret: 'Client Secret',
      api_key: 'API Key',
      merchant_id: 'Merchant ID',
      mode: 'Mode (sandbox/live)',
    };
    return labels[field] || field;
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Settings' }, { label: 'Payments' }]}>
      <Head title="Payment Settings" />

      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-2">
            Payment Gateway Configuration
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Configure your payment processor credentials to accept customer payments
          </p>
        </div>

        {/* Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <p className="font-semibold mb-1">Keep your credentials secure</p>
            <p>Never share your secret keys. These are saved securely and only used for payment processing.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {Object.entries(gateways).map(([gatewayKey, gateway]) => (
            <div key={gatewayKey} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-6">
              {/* Gateway Header */}
              <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <h2 className="text-xl font-bold mb-1">{gateway.name}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{gateway.description}</p>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {gateway.fields.map((field) => {
                  const isSecret = isSecretField(field);
                  const key = `${gatewayKey}-${field}`;
                  const value = formData[gatewayKey]?.[field] || '';
                  const isVisible = showSecrets[key];

                  return (
                    <div key={field}>
                      <label className="block text-sm font-semibold mb-2">
                        {getFieldLabel(field)}
                      </label>
                      <div className="relative">
                        <input
                          type={isSecret && !isVisible ? 'password' : 'text'}
                          value={value}
                          onChange={(e) => handleInputChange(gatewayKey, field, e.target.value)}
                          placeholder={`Enter your ${getFieldLabel(field).toLowerCase()}`}
                          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-foreground pr-10"
                        />
                        {isSecret && (
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(key)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Documentation Link */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <a
                  href={`https://docs.${gatewayKey}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View {gateway.name} documentation →
                </a>
              </div>
            </div>
          ))}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">💡 How to get your credentials</h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li><strong>Stripe:</strong> Log in to Stripe Dashboard → Developers → API Keys</li>
            <li><strong>PayPal:</strong> Log in to PayPal Business → Apps & Credentials</li>
            <li><strong>OSOW:</strong> Contact OSOW support for API credentials</li>
            <li><strong>Yoco:</strong> Log in to Yoco Dashboard → Developers → API Keys</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
