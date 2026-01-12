import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, PenLine, LogIn, LogOut } from 'lucide-react'; // Adicionado LogOut
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export function Header({ onSearch, showSearch = true }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth(); // Adicionado signOut
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminClick = () => {
    if (location.pathname.startsWith('/artigo/')) {
      const currentSlug = location.pathname.split('/').pop();
      if (currentSlug) {
        navigate(`/admin?edit=${currentSlug}`);
        return;
      }
    }
    navigate('/admin');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-serif text-2xl font-bold text-foreground">
          Caderno de Estudos
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {showSearch && (
            <div className={`flex items-center transition-all duration-300 ${
              isSearchOpen ? 'w-full md:w-64' : 'w-auto'
            }`}>
              {isSearchOpen ? (
                <div className="relative w-full">
                  <Input
                    type="search"
                    placeholder="Buscar artigos..."
                    className="w-full pr-8"
                    autoFocus
                    onChange={(e) => onSearch?.(e.target.value)}
                    onBlur={() => !onSearch && setIsSearchOpen(false)}
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleAdminClick}>
                <PenLine className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Escrever</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}