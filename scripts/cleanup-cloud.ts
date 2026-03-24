
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    console.log('Starting cleanup of empty MATH-* records...');

    let page = 0;
    const pageSize = 100;
    let deletedCount = 0;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('math_progress')
            .select('id, data')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('Error fetching data:', error);
            break;
        }

        if (!data || data.length === 0) {
            hasMore = false;
            break;
        }

        const idsToDelete: string[] = [];

        for (const row of data as Array<{ id: string; data: unknown }>) {
            // Check if it's a MATH record
            if (row.id.startsWith('MATH-')) {
                let isEmpty = false;

                if (!row.data) {
                    isEmpty = true;
                } else {
                    try {
                        let appData: unknown = row.data;
                        if (typeof appData === 'string') {
                            appData = JSON.parse(appData);
                        }

                        const parsedData = (typeof appData === 'object' && appData !== null
                            ? appData
                            : {}) as { profiles?: unknown[] };

                        // Rule: If profiles is empty or undefined, it's garbage
                        if (!parsedData.profiles || !Array.isArray(parsedData.profiles) || parsedData.profiles.length === 0) {
                            isEmpty = true;
                        }
                    } catch (e) {
                        console.log(`Error parsing data for ${row.id}, marking as bad:`, e);
                        isEmpty = true;
                    }
                }

                if (isEmpty) {
                    idsToDelete.push(row.id);
                }
            }
        }

        if (idsToDelete.length > 0) {
            console.log(`Deleting ${idsToDelete.length} empty records...`);
            const { error: deleteError } = await supabase
                .from('math_progress')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) {
                console.error('Error deleting records:', deleteError);
            } else {
                deletedCount += idsToDelete.length;
            }
        }

        if (data.length < pageSize) {
            hasMore = false;
        } else {
            page++;
        }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} records.`);
}

cleanup();
