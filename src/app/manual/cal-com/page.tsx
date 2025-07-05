export default function CalComManualPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-blue-600 dark:bg-blue-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Cal.com Handleiding
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              Leer hoe je Cal.com kunt integreren met je digitale assistent
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Hierbij de handleiding
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300">
              Op deze pagina vind je informatie over hoe je een Cal.com account kunt aanmaken en integreren met je digitale assistent.
            </p>
            
            {/* Placeholder content - to be expanded later */}
            <div className="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-blue-700 dark:text-blue-300">
                Deze handleiding is momenteel in ontwikkeling. Kom later terug voor de volledige instructies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 