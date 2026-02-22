import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, languages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import polygonLogo from "@/assets/polygon-logo.svg";

const Login = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang, setLang } = useTranslation();

  const handleLogin = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("full_name", trimmed)
        .maybeSingle();

      let profileId: string;

      let status: "pending_approval" | "approved";

      if (existing) {
        profileId = existing.id;

        // Fetch existing status
        const { data: profileData } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", profileId)
          .maybeSingle();
        status = (profileData?.status as "pending_approval" | "approved") ?? "pending_approval";

        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profileId)
          .maybeSingle();

        if (!existingRole) {
          const { data: countData } = await supabase.rpc("get_user_count");
          const isFirst = (countData ?? 0) === 1;
          await supabase.from("user_roles").insert({
            user_id: profileId,
            role: isFirst ? "leader" : "employee",
          });
        }
      } else {
        const { data: countData } = await supabase.rpc("get_user_count");
        const isFirst = (countData ?? 0) === 0;
        status = isFirst ? "approved" : "pending_approval";

        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({ full_name: trimmed, status } as any)
          .select("id")
          .single();

        if (profileError || !newProfile) throw profileError;
        profileId = newProfile.id;

        await supabase.from("user_roles").insert({
          user_id: profileId,
          role: isFirst ? "leader" : "employee",
        });
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", profileId)
        .maybeSingle();

      const role = roleData?.role ?? "employee";

      setUser({ id: profileId, full_name: trimmed, role, status });

      if (status === "pending_approval") {
        navigate("/pending");
      } else {
        navigate(role === "leader" ? "/dashboard" : "/disc-test");
      }
    } catch (err) {
      toast({
        title: t.common.error,
        description: t.common.somethingWentWrong,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4 relative">
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
              <Globe className="h-4 w-4" />
              {languages.find((l) => l.code === lang)?.label}
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
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-xl">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto mb-2">
            <img src={polygonLogo} alt="Polygon Group" className="h-12 mx-auto" />
          </div>
          <CardTitle className="text-3xl">{t.login.title}</CardTitle>
          <CardDescription className="text-base">{t.login.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Input
            placeholder={t.login.placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="h-12 text-base rounded-xl"
            autoFocus
          />
          <Button
            onClick={handleLogin}
            disabled={!name.trim() || loading}
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            {loading ? t.login.buttonLoading : t.login.button}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
