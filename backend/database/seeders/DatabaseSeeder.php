<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use App\Models\User;
use App\Models\BlogPost;
use App\Models\LawyerAvailability;
use App\Models\LawyerProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Super Admin (created once, never via public registration) ─────
        User::updateOrCreate(['email' => 'admin@lankarealty.lk'], [
            'name'     => 'Site Admin',
            'password' => Hash::make('Admin@LKR2026!'),
            'role'     => 'admin',
            'status'   => 'active',
            'phone'    => '+94 11 234 5678',
        ]);

        User::updateOrCreate(['email' => 'admin@knwprorealtor.lk'], [
            'name'     => 'KNW Admin',
            'password' => Hash::make('Admin@12345'),
            'role'     => 'admin',
            'status'   => 'active',
            'phone'    => '+94 11 222 3344',
        ]);

        // ── 2. Demo Staff member ─────────────────────────────────────────────
        User::updateOrCreate(['email' => 'staff@lankarealty.lk'], [
            'name'     => 'Nimal Perera',
            'password' => Hash::make('Staff@LKR2026!'),
            'role'     => 'staff',
            'status'   => 'active',
            'phone'    => '+94 77 123 4567',
        ]);

        // ── 3. Demo Lawyer ───────────────────────────────────────────────────
        $lawyer = User::updateOrCreate(['email' => 'lawyer@lankarealty.lk'], [
            'name'     => 'Priya Fernando',
            'password' => Hash::make('Lawyer@LKR2026!'),
            'role'     => 'lawyer',
            'status'   => 'active',
            'phone'    => '+94 71 987 6543',
        ]);

        LawyerProfile::updateOrCreate(['user_id' => $lawyer->id], [
            'specialization' => 'Property law, title verification, foreign buyer advice',
            'bio' => 'Senior Sri Lankan property lawyer helping buyers and sellers verify title, prepare deeds, and complete safe property transactions.',
            'office_location' => 'Colombo 07',
            'consultation_fee' => 7500,
            'languages' => ['English', 'Sinhala', 'Tamil'],
            'is_available' => true,
        ]);

        foreach ([1, 3, 5] as $weekday) {
            LawyerAvailability::updateOrCreate([
                'lawyer_id' => $lawyer->id,
                'weekday' => $weekday,
                'start_time' => '09:00:00',
            ], [
                'end_time' => '12:00:00',
                'slot_minutes' => 30,
                'is_active' => true,
            ]);
        }

        // ── 4. Demo approved Seller ──────────────────────────────────────────
        User::updateOrCreate(['email' => 'seller@lankarealty.lk'], [
            'name'       => 'Kamal Silva',
            'password'   => Hash::make('Seller@LKR2026!'),
            'role'       => 'seller',
            'status'     => 'active',
            'phone'      => '+94 76 555 4321',
            'nic_number' => '199012345678',
            'address'    => 'Colombo 05',
            'approved_at'=> now(),
            'approved_by'=> 1, // admin
        ]);

        // ── 5. Demo pending Seller ───────────────────────────────────────────
        User::updateOrCreate(['email' => 'seller.pending@lankarealty.lk'], [
            'name'       => 'Sunil Jayasuriya',
            'password'   => Hash::make('Seller@LKR2026!'),
            'role'       => 'seller',
            'status'     => 'pending',
            'phone'      => '+94 70 444 3322',
            'nic_number' => '198556789012',
            'address'    => 'Kandy',
        ]);

        // ── 6. Demo Buyer ────────────────────────────────────────────────────
        User::updateOrCreate(['email' => 'buyer@lankarealty.lk'], [
            'name'   => 'Emma Watson',
            'password' => Hash::make('Buyer@LKR2026!'),
            'role'   => 'buyer',
            'status' => 'active',
            'phone'  => '+44 7700 123456',
        ]);

        BlogPost::updateOrCreate(['slug' => 'title-deed-verification-sri-lanka'], [
            'author_id' => $lawyer->id,
            'title' => 'Complete Guide to Title Deed Verification in Sri Lanka',
            'excerpt' => 'Before buying property in Sri Lanka, verify ownership history, survey plans, encumbrances, court disputes, and seller authority.',
            'content' => 'Title deed verification is the most important legal step before buying land, a house, or an apartment in Sri Lanka. A buyer should review the deed chain, survey plan, boundaries, encumbrances, mortgages, caveats, access rights, and seller identity before paying a deposit. Always use a qualified lawyer or notary for transaction-specific advice.',
            'category' => 'Legal Tips',
            'tags' => ['Title Deed', 'Due Diligence', 'Legal'],
            'status' => 'published',
            'submitted_at' => now(),
            'approved_at' => now(),
            'approved_by' => 1,
            'published_at' => now(),
        ]);

        $this->call(PropertySeeder::class);

        $this->command->info('✅ All demo users seeded successfully!');
        $this->command->table(
            ['Role', 'Email', 'Password', 'Status'],
            [
                ['Admin',          'admin@lankarealty.lk',         'Admin@LKR2026!',  'active'],
                ['Admin',          'admin@knwprorealtor.lk',       'Admin@12345',     'active'],
                ['Staff',          'staff@lankarealty.lk',         'Staff@LKR2026!',  'active'],
                ['Lawyer',         'lawyer@lankarealty.lk',        'Lawyer@LKR2026!', 'active'],
                ['Seller',         'seller@lankarealty.lk',        'Seller@LKR2026!', 'active'],
                ['Seller(pending)','seller.pending@lankarealty.lk','Seller@LKR2026!', 'pending'],
                ['Buyer',          'buyer@lankarealty.lk',         'Buyer@LKR2026!',  'active'],
            ]
        );
    }
}
