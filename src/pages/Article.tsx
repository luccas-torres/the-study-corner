import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { CommentSection } from '@/components/CommentSection';
import { LatexRenderer } from '@/components/LatexRenderer';
import { supabase } from '@/integrations/supabase/client';

interface Article {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string | null;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (!articleError && articleData) {
      setArticle(articleData);
      fetchComments(articleData.id);
    }
    setLoading(false);
  };

  const fetchComments = async (articleId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header showSearch={false} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Artigo não encontrado
          </h1>
          <Link to="/" className="text-primary hover:underline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  const date = article.published_at || article.created_at;
  const formattedDate = format(new Date(date), "d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header showSearch={false} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <article className="max-w-3xl mx-auto animate-fade-in">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <time>{formattedDate}</time>
            </div>
          </header>

          {/* Cover image */}
          {article.cover_image && (
            <figure className="mb-10">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full rounded-lg shadow-elevated"
              />
            </figure>
          )}

          {/* Content */}
          <div className="prose max-w-none">
            <LatexRenderer content={article.content} />
          </div>

          {/* Comments */}
          <CommentSection
            articleId={article.id}
            comments={comments}
            onCommentAdded={() => fetchComments(article.id)}
          />
        </article>
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

export default ArticlePage;
