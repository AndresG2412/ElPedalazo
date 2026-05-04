import { Search } from 'lucide-react';

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ 
  searchTerm, 
  setSearchTerm, 
  placeholder = "Buscar...", 
  className = "flex-1" 
}: SearchInputProps) {
  return (
    <div className={`${className} relative`}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pedal-primary-glow/50 focus:ring-2 focus:ring-pedal-primary-glow/20 transition-all"
      />
    </div>
  );
}