import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';

interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
}

export function ArticleCard({
  slug,
  title,
  excerpt,
  coverImage,
  publishedAt,
  createdAt,
}: ArticleCardProps) {
  const date = publishedAt || createdAt;
  const formattedDate = format(new Date(date), "d 'de' MMMM, yyyy", {
    locale: ptBR,
  });

  return (
    <Link to={`/artigo/${slug}`} className="group block">
      <article className="bg-card rounded-lg overflow-hidden shadow-soft transition-smooth hover:shadow-elevated hover:-translate-y-1">
        {coverImage && (
          <div className="aspect-[16/9] overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-smooth group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h2>
          {excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
