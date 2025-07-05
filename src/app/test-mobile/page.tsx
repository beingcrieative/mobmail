'use client';

export default function TestMobilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center max-w-lg mx-auto p-6">
        <div className="text-6xl mb-4">📱</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Mobile Interface Test
        </h1>
        <p className="text-gray-600 mb-8">
          Kies welke mobile interface je wilt testen:
        </p>
        
        <div className="space-y-4">
          <a 
            href="/mobile-v3" 
            className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            🚀 Nieuwe Mobile V3 Interface
            <div className="text-sm text-blue-100 mt-1">Native feel, gestures, nieuwe UI</div>
          </a>
          
          <a 
            href="/mobile-v2" 
            className="block w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            📊 Mobile V2 Interface
            <div className="text-sm text-green-100 mt-1">Bestaande interface</div>
          </a>
          
          <a 
            href="/mobile" 
            className="block w-full px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
          >
            📱 Original Mobile
            <div className="text-sm text-gray-100 mt-1">Eerste versie</div>
          </a>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            💡 <strong>Tip:</strong> Test op je telefoon via het network adres voor de beste ervaring!
          </p>
        </div>
      </div>
    </div>
  );
}
