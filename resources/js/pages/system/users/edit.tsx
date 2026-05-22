import { FormEvent, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '../../../layouts/app-layout';

interface EditProps {
    user: {
        id: number;
        name: string;
        email: string;
        roles: string[];
    };
    roles: string[];
}

export default function EditUser() {
    const { user, roles } = usePage().props as any as EditProps;
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: user.roles,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.put(route('system.users.update', user.id), formData, {
            onFinish: () => setLoading(false),
        });
    };

    const toggleRole = (role: string) => {
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
        }));
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'System' }, { label: 'Users', href: route('system.users.index') }, { label: `Edit ${user.name}` }]}>
            <div className="max-w-2xl">
                <div className="mb-8">
                    <Link href={route('system.users.index')} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4">
                        <ArrowLeft className="size-4" />
                        Back to Users
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Edit User</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Info Card */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                        <h2 className="text-lg font-bold">User Information</h2>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-foreground"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-foreground"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Card */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                        <h2 className="text-lg font-bold">Change Password</h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Leave blank to keep the current password</p>

                        <div>
                            <label className="block text-sm font-semibold mb-2">New Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-foreground"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-foreground"
                            />
                        </div>
                    </div>

                    {/* Roles Card */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                        <h2 className="text-lg font-bold">Roles</h2>
                        <div className="space-y-3">
                            {roles.map((role) => (
                                <label key={role} className="flex items-center gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                    <input
                                        type="checkbox"
                                        checked={formData.roles.includes(role)}
                                        onChange={() => toggleRole(role)}
                                        className="w-4 h-4 rounded accent-foreground"
                                    />
                                    <span className="font-semibold capitalize">{role}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <button type="submit" disabled={loading} className="flex-1 h-12 bg-foreground text-background rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link href={route('system.users.index')} className="flex-1 h-12 border border-zinc-300 dark:border-zinc-600 rounded-lg font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-center">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
