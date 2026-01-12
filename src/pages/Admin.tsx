import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setArticles(data);
    }
    setLoading(false);
  };

  const openEditor = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setTitle(article.title);
      setExcerpt(article.excerpt || '');
      setContent(article.content);
      setCoverImage(article.cover_image || '');
      setPublished(article.published);
    } else {
      setEditingArticle(null);
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverImage('');
      setPublished(false);
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingArticle(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setPublished(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Erro',
        description: 'Título e conteúdo são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    const articleData = {
      title: title.trim(),
      slug: editingArticle?.slug || generateSlug(title),
      excerpt: excerpt.trim() || null,
      content,
      cover_image: coverImage.trim() || null,
      published,
      published_at: published && !editingArticle?.published_at ? new Date().toISOString() : editingArticle?.published_at,
      author_id: user!.id,
    };

    let error;

    if (editingArticle) {
      const { error: updateError } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editingArticle.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('articles')
        .insert(articleData);
      error = insertError;
    }

    setSaving(false);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o artigo.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Sucesso',
      description: editingArticle ? 'Artigo atualizado!' : 'Artigo criado!',
    });

    closeEditor();
    fetchArticles();
  };

  const handleDelete = async () => {
    if (!deleteArticle) return;

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', deleteArticle.id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o artigo.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Sucesso',
      description: 'Artigo excluído.',
    });

    setDeleteArticle(null);
    fetchArticles();
  };

  const togglePublished = async (article: Article) => {
    const newPublished = !article.published;
    const { error } = await supabase
      .from('articles')
      .update({
        published: newPublished,
        published_at: newPublished && !article.published_at ? new Date().toISOString() : article.published_at,
      })
      .eq('id', article.id);

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive',
      });
      return;
    }

    fetchArticles();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-serif text-xl font-bold">Painel de Administração</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => openEditor()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Artigo
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {articles.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-lg">
              <h2 className="font-serif text-2xl text-foreground mb-2">
                Nenhum artigo ainda
              </h2>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro artigo.
              </p>
              <Button onClick={() => openEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Artigo
              </Button>
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article.id}
                className="bg-card p-6 rounded-lg shadow-soft flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {article.published ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                        <Eye className="h-3 w-3" />
                        Publicado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        <EyeOff className="h-3 w-3" />
                        Rascunho
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-semibold text-lg truncate">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(article.updated_at), "d 'de' MMMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePublished(article)}
                    title={article.published ? 'Despublicar' : 'Publicar'}
                  >
                    {article.published ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditor(article)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteArticle(article)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingArticle ? 'Editar Artigo' : 'Novo Artigo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título do artigo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo (opcional)</Label>
              <Textarea
                id="excerpt"
                placeholder="Breve descrição do artigo"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">URL da Imagem de Capa (opcional)</Label>
              <Input
                id="cover"
                placeholder="https://exemplo.com/imagem.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <RichTextEditor content={content} onChange={setContent} />
              <p className="text-xs text-muted-foreground">
                Use $$ para LaTeX em bloco e $ para inline. Exemplo: $$\frac{"{1}"}{"{2}"}$$
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
              <Label htmlFor="published">Publicar artigo</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEditor}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteArticle} onOpenChange={() => setDeleteArticle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O artigo "{deleteArticle?.title}" será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
