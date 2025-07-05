export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>🚀 Simple Test Page</h1>
      <p>Als je dit ziet, werkt de server!</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/mobile-v3" style={{ 
          background: 'blue', 
          color: 'white', 
          padding: '10px 20px', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Ga naar Mobile V3
        </a>
      </div>
    </div>
  );
}