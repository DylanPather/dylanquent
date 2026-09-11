import { Link, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, Shield } from 'lucide-react';
import AppLayout from '../../../layouts/app-layout';
import { Pagination } from '../../../components/pagination';

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    email_verified_at: string | null;
    created_at: string;
}

interface Props {
    users: {
        data: User[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
}

export default function UserIndex({ users }: Props) {
    const handleDelete = (userId: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('system.users.destroy', userId));
        }
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
            manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
            staff: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
            customer: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
        };
        return colors[role] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'System' }, { label: 'Users' }]}>
            <div className="max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter">User Management</h1>
                    <Link href={route('system.users.create')} className="flex items-center gap-2 h-12 px-6 bg-foreground text-background rounded-lg font-semibold hover:opacity-90">
                        <Plus className="size-4" />
                        Add User
                    </Link>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                                    <th className="text-left px-6 py-4 font-semibold">Name</th>
                                    <th className="text-left px-6 py-4 font-semibold">Email</th>
                                    <th className="text-left px-6 py-4 font-semibold">Roles</th>
                                    <th className="text-left px-6 py-4 font-semibold">Status</th>
                                    <th className="text-right px-6 py-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold">{user.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.map((role) => (
                                                    <span key={role} className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getRoleBadgeColor(role)}`}>
                                                        <Shield className="size-3" />
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.email_verified_at ? (
                                                <span className="px-3 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Verified</span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('system.users.edit', user.id)} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    <Edit className="size-4" />
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="size-4" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination
                    links={users.links}
                    currentPage={users.current_page}
                    lastPage={users.last_page}
                    label="Users"
                    className="mt-8"
                />
            </div>
        </AppLayout>
    );
}
