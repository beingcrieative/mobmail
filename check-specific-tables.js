const { createClient } = require('@supabase/supabase-js');

// Environment variables
const supabaseUrl = 'https://jtljjonmvougfhkbwzsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0bGpqb25tdm91Z2Zoa2J3enN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODgwOTUsImV4cCI6MjA1OTE2NDA5NX0.RybJJrJc0Wt2tWIWI7siM7gvMQFId0D63JhjkobBdbQ';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tables found in the codebase
const tablesToCheck = [
  'subscriptions',
  'contact_submissions', 
  'contact_form',
  'call_transcriptions',
  'profiles',
  'users'
];

async function checkTableStructure(tableName) {
  try {
    console.log(`\n📊 Checking table: ${tableName}`);
    console.log('─'.repeat(50));
    
    // Try to get a single row to understand the structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (error) {
      console.error(`❌ Error accessing table ${tableName}:`, error.message);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log(`✅ Table ${tableName} exists but is empty`);
      
      // Try to get table structure by selecting with limit 0
      const { data: structure, error: structureError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
        
      if (structureError) {
        console.error(`❌ Error getting structure for ${tableName}:`, structureError.message);
        return null;
      }
      
      console.log(`📋 Table structure discovered (empty table)`);
      return { tableName, exists: true, empty: true, sampleData: null };
    }
    
    console.log(`✅ Table ${tableName} exists with data`);
    console.log(`📋 Sample row structure:`);
    
    const sampleRow = data[0];
    Object.keys(sampleRow).forEach(key => {
      const value = sampleRow[key];
      const type = typeof value;
      const displayValue = value === null ? 'NULL' : 
                          type === 'string' ? `"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`  :
                          type === 'object' ? JSON.stringify(value).substring(0, 50) + '...' :
                          String(value);
      console.log(`  • ${key}: ${displayValue} (${type})`);
    });
    
    return { tableName, exists: true, empty: false, sampleData: sampleRow };
    
  } catch (error) {
    console.error(`❌ Unexpected error checking table ${tableName}:`, error.message);
    return null;
  }
}

async function checkAllTables() {
  console.log('🔍 Checking Supabase database tables...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 10) + '...');
  console.log('\n' + '='.repeat(60));
  
  const results = [];
  
  for (const tableName of tablesToCheck) {
    const result = await checkTableStructure(tableName);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  const existingTables = results.filter(r => r.exists);
  const tablesWithData = results.filter(r => r.exists && !r.empty);
  const emptyTables = results.filter(r => r.exists && r.empty);
  
  console.log(`✅ Tables found: ${existingTables.length}`);
  console.log(`📊 Tables with data: ${tablesWithData.length}`);
  console.log(`📭 Empty tables: ${emptyTables.length}`);
  
  if (existingTables.length > 0) {
    console.log('\n📋 Existing tables:');
    existingTables.forEach(table => {
      const status = table.empty ? '(empty)' : '(has data)';
      console.log(`  • ${table.tableName} ${status}`);
    });
  }
  
  return results;
}

checkAllTables().then(() => {
  console.log('\n✅ Database check completed!');
}).catch(error => {
  console.error('❌ Error during database check:', error);
});