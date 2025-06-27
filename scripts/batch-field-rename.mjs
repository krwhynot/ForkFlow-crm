import replace from 'replace-in-file';

const replacements = [
    // Add more as needed
    { from: /first_name/g, to: 'firstName' },
    { from: /last_name/g, to: 'lastName' },
    { from: /company_id/g, to: 'organizationId' },
    { from: /company_name/g, to: 'organization?.name' },
    { from: /archived_at/g, to: 'archivedAt' },
    { from: /expected_closing_date/g, to: 'expectedClosingDate' },
    { from: /contact_ids/g, to: 'contactIds' },
    { from: /email_jsonb/g, to: 'email' },
    { from: /phone_jsonb/g, to: 'phone' },
    { from: /sales_id/g, to: 'salesId' },
    { from: /created_at/g, to: 'createdAt' },
    { from: /updated_at/g, to: 'updatedAt' },
    // Add more as needed
];

for (const { from, to } of replacements) {
    try {
        const results = await replace({
            files: [
                'src/**/*.ts',
                'src/**/*.tsx',
                'src/**/*.js',
                'src/**/*.jsx',
            ],
            from,
            to,
            countMatches: true,
            dry: false, // Set to true for a dry run (no changes)
        });
        const totalChanged = results.reduce((acc, file) => acc + file.numReplacements, 0);
        if (totalChanged > 0) {
            console.log(`Replaced ${from} → ${to}: ${totalChanged} changes`);
        }
    } catch (error) {
        console.error(`Error replacing ${from}:`, error);
    }
}
console.log('Batch field renaming complete!');
