
console.log('🏠 Index.tsx: Index component loading...');

const Index = () => {
  console.log('🏠 Index.tsx: Index component rendering...');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue dans votre application !</h1>
        <p className="text-xl text-muted-foreground">Commencez à construire votre projet incroyable ici !</p>
        <p className="text-sm text-green-600 mt-4">✅ L'aperçu fonctionne maintenant !</p>
      </div>
    </div>
  );
};

console.log('🏠 Index.tsx: Index component defined');

export default Index;
