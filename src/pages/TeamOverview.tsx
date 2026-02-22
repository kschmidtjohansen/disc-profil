import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, languages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ChevronDown, Check, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import polygonLogo from "@/assets/polygon-logo.svg";

interface TeamMember {
  id: string;
  full_name: string;
  primary_style: string;
}

const QUADRANTS = [
  { key: "D", label: "D", bgClass: "bg-red-50", borderClass: "border-red-200", dotBg: "bg-red-100 border-red-400 text-red-700", accentText: "text-red-600" },
  { key: "I", label: "I", bgClass: "bg-yellow-50", borderClass: "border-yellow-200", dotBg: "bg-yellow-100 border-yellow-400 text-yellow-700", accentText: "text-yellow-600" },
  { key: "S", label: "S", bgClass: "bg-green-50", borderClass: "border-green-200", dotBg: "bg-green-100 border-green-400 text-green-700", accentText: "text-green-600" },
  { key: "C", label: "C", bgClass: "bg-blue-50", borderClass: "border-blue-200", dotBg: "bg-blue-100 border-blue-400 text-blue-700", accentText: "text-blue-600" },
] as const;

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const TeamOverview = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, lang, setLang } = useTranslation();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.role !== "leader") {
      toast({ title: t.common.accessDenied, description: t.common.leaderOnly });
      navigate("/disc-test");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name");
    const { data: results } = await supabase.from("disc_results").select("user_id, primary_style");

    const resultsMap = new Map(results?.map((r) => [r.user_id, r.primary_style]));
    const completed: TeamMember[] = (profiles ?? [])
      .filter((p) => resultsMap.has(p.id))
      .map((p) => ({ id: p.id, full_name: p.full_name, primary_style: resultsMap.get(p.id)! }));

    setMembers(completed);
    setLoading(false);
  };

  const grouped = members.reduce<Record<string, TeamMember[]>>((acc, m) => {
    const key = m.primary_style.split("/")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const handleLogout = () => { logout(); navigate("/"); };

  const NavDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-base sm:text-xl font-semibold text-primary-foreground hover:opacity-80 transition-opacity">
          {t.common.discProfile}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-popover">
        <DropdownMenuItem onClick={() => navigate("/disc-test")} className="cursor-pointer">
          {location.pathname === "/disc-test" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/disc-test" ? "ml-6" : ""}>{t.common.employee}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
          {location.pathname === "/dashboard" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/dashboard" ? "ml-6" : ""}>{t.common.leader}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/team-overview")} className="cursor-pointer">
          {location.pathname === "/team-overview" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/team-overview" ? "ml-6" : ""}>{t.teamOverview.title}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/team-analyzer")} className="cursor-pointer">
          {location.pathname === "/team-analyzer" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/team-analyzer" ? "ml-6" : ""}>{t.teamAnalyzer.title}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const LanguageDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages.find((l) => l.code === lang)?.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {languages.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="cursor-pointer">
            {lang === l.code && <Check className="mr-2 h-4 w-4" />}
            <span className={lang !== l.code ? "ml-6" : ""}>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>{t.common.loading}</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={polygonLogo} alt="Polygon" className="h-7 sm:h-8 brightness-0 invert cursor-pointer" onClick={() => navigate("/disc-test")} />
          <NavDropdown />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageDropdown />
          <span className="text-sm opacity-80 hidden sm:inline">{user?.full_name}</span>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/80 text-sm">
            <LogOut className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t.common.logout}</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 mt-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t.teamOverview.title}</h1>
          <p className="text-muted-foreground">{t.teamOverview.subtitle}</p>
        </div>

        {members.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">{t.teamOverview.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border rounded-xl overflow-hidden shadow-lg">
            {QUADRANTS.map((q) => {
              const desc = t.disc.descriptions[q.key as keyof typeof t.disc.descriptions];
              const people = grouped[q.key] || [];
              return (
                <div key={q.key} className={`${q.bgClass} border ${q.borderClass} p-4 sm:p-6 min-h-[200px] flex flex-col`}>
                  <div className={`flex items-center gap-2 mb-4 ${q.accentText}`}>
                    <span className="text-2xl font-bold">{q.label}</span>
                    <span className="text-sm font-medium opacity-80">{desc?.title}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 flex-1 items-start content-start">
                    {people.map((person) => {
                      const style = person.primary_style.split("/")[0];
                      const personDesc = t.disc.descriptions[style as keyof typeof t.disc.descriptions];
                      const traits = personDesc?.traits?.slice(0, 3) ?? [];
                      return (
                        <Popover key={person.id}>
                          <PopoverTrigger asChild>
                            <button
                              className={`w-10 h-10 rounded-full border-2 ${q.dotBg} flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform`}
                              title={person.full_name}
                            >
                              {getInitials(person.full_name)}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-3">
                            <p className="font-semibold text-sm">{person.full_name}</p>
                            <p className="text-xs text-muted-foreground mb-2">{personDesc?.title}</p>
                            <p className="text-xs font-medium text-muted-foreground mb-1">{t.teamOverview.topTraits}</p>
                            <div className="flex flex-wrap gap-1">
                              {traits.map((tr) => (
                                <Badge key={tr} variant="outline" className="text-xs">{tr}</Badge>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      );
                    })}
                    {people.length === 0 && (
                      <span className="text-xs text-muted-foreground/60 italic">{t.teamOverview.noResults}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeamOverview;
