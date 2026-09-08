<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissionList = [
            // Dashboard
            'view_dashboard',

            // Products
            'view_products',
            'create_products',
            'edit_products',
            'delete_products',
            'manage_categories',
            'manage_collections',
            'manage_variants',

            // Orders
            'view_orders',
            'manage_orders',
            'refund_orders',
            'mark_shipped',

            // Inventory
            'view_inventory',
            'manage_inventory',
            'manage_warehouses',
            'manage_purchase_orders',

            // Customers
            'view_customers',
            'manage_customers',

            // Discounts
            'view_discounts',
            'create_discounts',
            'edit_discounts',
            'delete_discounts',

            // Staff
            'manage_staff',
            'view_staff',
            'edit_staff',
            'delete_staff',

            // Roles & Permissions
            'manage_roles',
            'manage_permissions',

            // Settings
            'view_settings',
            'manage_settings',
            'manage_storefront',

            // Analytics
            'view_analytics',
            'view_reports',
        ];

        // Create permissions
        foreach ($permissionList as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $permission, 'guard_name' => 'web'],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        // Get all permissions
        $permissions = DB::table('permissions')->get();

        // Create roles
        $adminRole = DB::table('roles')->updateOrInsert(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['created_at' => now(), 'updated_at' => now()]
        );

        $managerRole = DB::table('roles')->updateOrInsert(
            ['name' => 'manager', 'guard_name' => 'web'],
            ['created_at' => now(), 'updated_at' => now()]
        );

        $staffRole = DB::table('roles')->updateOrInsert(
            ['name' => 'staff', 'guard_name' => 'web'],
            ['created_at' => now(), 'updated_at' => now()]
        );

        DB::table('roles')->updateOrInsert(
            ['name' => 'customer', 'guard_name' => 'web'],
            ['created_at' => now(), 'updated_at' => now()]
        );

        // Admin gets all permissions
        $adminRoleId = DB::table('roles')->where('name', 'admin')->first()->id;
        foreach ($permissions as $permission) {
            DB::table('role_has_permissions')->updateOrInsert(
                ['role_id' => $adminRoleId, 'permission_id' => $permission->id],
                []
            );
        }

        // Manager permissions
        $managerRoleId = DB::table('roles')->where('name', 'manager')->first()->id;
        $managerPerms = ['view_dashboard', 'view_products', 'create_products', 'edit_products', 'manage_variants', 'view_orders', 'manage_orders', 'mark_shipped', 'view_inventory', 'manage_inventory', 'view_customers', 'view_discounts', 'create_discounts', 'edit_discounts', 'view_analytics', 'view_reports'];
        foreach ($managerPerms as $perm) {
            $permId = DB::table('permissions')->where('name', $perm)->first()?->id;
            if ($permId) {
                DB::table('role_has_permissions')->updateOrInsert(
                    ['role_id' => $managerRoleId, 'permission_id' => $permId],
                    []
                );
            }
        }

        // Staff permissions
        $staffRoleId = DB::table('roles')->where('name', 'staff')->first()->id;
        $staffPerms = ['view_dashboard', 'view_products', 'view_orders', 'manage_orders', 'mark_shipped', 'view_inventory', 'manage_inventory', 'view_customers', 'view_analytics'];
        foreach ($staffPerms as $perm) {
            $permId = DB::table('permissions')->where('name', $perm)->first()?->id;
            if ($permId) {
                DB::table('role_has_permissions')->updateOrInsert(
                    ['role_id' => $staffRoleId, 'permission_id' => $permId],
                    []
                );
            }
        }
    }
}
