import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, TrendingUp, DollarSign } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

export default function LoyaltyIndex() {
    const { members, stats } = usePage().props as any;

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'Gold':
                return <Badge className="bg-yellow-50 text-yellow-700">Gold</Badge>;
            case 'Silver':
                return <Badge className="bg-gray-50 text-gray-700">Silver</Badge>;
            case 'Bronze':
                return <Badge className="bg-orange-50 text-orange-700">Bronze</Badge>;
            default:
                return <Badge>{tier}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Marketing', href: '/marketing' },
            { title: 'Loyalty Program', href: '/marketing/loyalty' }
        ]}>
            <Head title="Loyalty Program" />

            <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Loyalty Program</h1>
                        <p className="text-sm text-muted-foreground">Reward and retain your best customers</p>
                    </div>
                    <Link href={route('marketing.loyalty.settings')}>
                        <Button variant="outline" className="h-11">
                            Program Settings
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {[
                        { label: 'Total Members', value: stats.total_members, icon: Users, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Gold Tier', value: stats.gold_tier, icon: Gift, color: 'bg-yellow-50 text-yellow-700' },
                        { label: 'Points Issued', value: stats.total_points_issued.toLocaleString(), icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
                        { label: 'Avg LTV', value: `R${stats.avg_lifetime_value.toFixed(0)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-700' },
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-background">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-2">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Members Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-bold">Member</TableHead>
                                    <TableHead className="font-bold">Tier</TableHead>
                                    <TableHead className="font-bold">Points</TableHead>
                                    <TableHead className="hidden md:table-cell font-bold">Lifetime Spent</TableHead>
                                    <TableHead className="hidden lg:table-cell font-bold">Joined</TableHead>
                                    <TableHead className="text-right font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member: any) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-bold">{member.name}</TableCell>
                                        <TableCell>{getTierBadge(member.tier)}</TableCell>
                                        <TableCell className="font-bold">{member.points.toLocaleString()}</TableCell>
                                        <TableCell className="hidden md:table-cell">R{member.lifetime_spent.toFixed(2)}</TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm">{member.joined_at}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm">View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
