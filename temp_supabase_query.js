const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://jtljjonmvougfhkbwzsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bGpqb25tdm91Z2Zoa2J3enN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODgwOTUsImV4cCI6MjA1OTE2NDA5NX0.RybJJrJc0Wt2tWIWI7siM7gvMQFId0D63JhjkobBdbQ';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getTableStructure() {
  try {
    console.log('🔍 Connecting to Supabase...');
    
    // First, check if the table exists by trying to query the information schema
    // This will give us the table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_name', 'voicemailai')
      .order('ordinal_position');

    if (tableError) {
      console.log('ℹ️  Cannot access information_schema directly. Trying alternative approach...');
      
      // Alternative: Try to get table structure by querying the table with limit 0
      const { data: emptyQuery, error: emptyError } = await supabase
        .from('voicemailai')
        .select('*')
        .limit(0);
      
      if (emptyError) {
        console.log('❌ Error querying voicemailai table:', emptyError.message);
        
        // Let's try to list all tables to see what's available
        console.log('\n🔍 Checking available tables...');
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (tablesError) {
          console.log('❌ Cannot access table information:', tablesError.message);
          return;
        }
        
        console.log('📋 Available tables:');
        tables.forEach(table => console.log(`  - ${table.table_name}`));
        return;
      }
      
      console.log('✅ Table exists but structure details not accessible via information_schema');
    } else {
      console.log('✅ Table structure retrieved from information_schema');
      console.log('\n📋 Table: voicemailai');
      console.log('=' .repeat(50));
      
      tableInfo.forEach(column => {
        console.log(`Column: ${column.column_name}`);
        console.log(`  Type: ${column.data_type}`);
        console.log(`  Nullable: ${column.is_nullable}`);
        console.log(`  Default: ${column.column_default || 'None'}`);
        console.log('');
      });
    }
    
    // Now try to get sample data
    console.log('\n🎯 Fetching sample data...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('voicemailai')
      .select('*')
      .limit(5);
    
    if (sampleError) {
      console.log('❌ Error fetching sample data:', sampleError.message);
      return;
    }
    
    if (sampleData && sampleData.length > 0) {
      console.log(`✅ Found ${sampleData.length} sample records`);
      console.log('\n📊 Sample Data:');
      console.log('=' .repeat(50));
      
      // Show column names from first record
      const columns = Object.keys(sampleData[0]);
      console.log('Columns:', columns.join(', '));
      console.log('');
      
      // Show each record
      sampleData.forEach((record, index) => {
        console.log(`Record ${index + 1}:`);
        columns.forEach(col => {
          const value = record[col];
          const displayValue = typeof value === 'string' && value.length > 100 
            ? value.substring(0, 100) + '...' 
            : value;
          console.log(`  ${col}: ${displayValue}`);
        });
        console.log('');
      });
    } else {
      console.log('ℹ️  No data found in the voicemailai table');
    }
    
    // Get table count
    const { count, error: countError } = await supabase
      .from('voicemailai')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`📈 Total records in table: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the function
getTableStructure();