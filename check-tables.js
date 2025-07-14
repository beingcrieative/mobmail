const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = 'https://jtljjonmvougfhkbwzsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bGpqb25tdm91Z2Zoa2J3enN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODgwOTUsImV4cCI6MjA1OTE2NDA5NX0.RybJJrJc0Wt2tWIWI7siM7gvMQFId0D63JhjkobBdbQ';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
  try {
    console.log('Connecting to Supabase database...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 10) + '...');
    
    // Get all tables from information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      
      // Try alternative approach using RPC if available
      console.log('\nTrying alternative approach...');
      
      // Query the pg_tables view
      const { data: pgTables, error: pgError } = await supabase.rpc('get_tables');
      
      if (pgError) {
        console.error('Error with RPC call:', pgError);
        
        // Try direct SQL query
        console.log('\nTrying direct query...');
        const { data: directTables, error: directError } = await supabase
          .rpc('exec_sql', { 
            query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 
          });
          
        if (directError) {
          console.error('Error with direct query:', directError);
          return;
        }
        
        console.log('Tables found via direct query:', directTables);
      } else {
        console.log('Tables found via RPC:', pgTables);
      }
    } else {
      console.log('\nTables found in the database:');
      console.log('============================');
      
      if (!tables || tables.length === 0) {
        console.log('No tables found in the public schema.');
        return;
      }
      
      for (const table of tables) {
        console.log(`\n📊 Table: ${table.table_name}`);
        console.log('─'.repeat(50));
        
        // Get column information for each table
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', table.table_name)
          .order('ordinal_position');
          
        if (columnsError) {
          console.error(`Error fetching columns for ${table.table_name}:`, columnsError);
          continue;
        }
        
        if (columns && columns.length > 0) {
          console.log('Columns:');
          columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
            console.log(`  • ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
          });
        } else {
          console.log('  No column information available');
        }
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listTables();