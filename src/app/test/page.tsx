/**
 * Minimal test page to debug URL issues
 */

export default function TestPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Test Page</h1>
      <p>If you can see this, the URL issue is isolated to specific pages.</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}