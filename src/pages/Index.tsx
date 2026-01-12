import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ArticleCard } from '@/components/ArticleCard';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, cover_image, published_at, created_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <section className="text-center mb-16 animate-fade-in">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Caderno de Estudos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resumos, anotações e reflexões sobre temas diversos. Um espaço para compartilhar conhecimento e aprendizados.
          </p>
        </section>

        {/* Articles grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article, index) => (
              <div
                key={article.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ArticleCard
                  id={article.id}
                  slug={article.slug}
                  title={article.title}
                  excerpt={article.excerpt || undefined}
                  coverImage={article.cover_image || undefined}
                  publishedAt={article.published_at || undefined}
                  createdAt={article.created_at}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="font-serif text-2xl text-foreground mb-2">
              {searchQuery ? 'Nenhum artigo encontrado' : 'Nenhum artigo publicado ainda'}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Tente buscar por outros termos.'
                : 'Os artigos aparecerão aqui quando forem publicados.'}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Caderno de Estudos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
