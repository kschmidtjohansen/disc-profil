import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import polygonLogo from "@/assets/polygon-logo.svg";

const Login = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

      if (existing) {
        profileId = existing.id;
      } else {
        const { data: countData } = await supabase.rpc("get_user_count");
        const isFirst = (countData ?? 0) === 0;

        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({ full_name: trimmed })
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
        .single();

      const role = roleData?.role ?? "employee";

      setUser({ id: profileId, full_name: trimmed, role });
      navigate(role === "leader" ? "/leader" : "/employee");
    } catch (err) {
      toast({
        title: "Fejl",
        description: "Noget gik galt. Prøv igen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-xl">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto mb-2">
            <img src={polygonLogo} alt="Polygon Group" className="h-12 mx-auto" />
          </div>
          <CardTitle className="text-3xl">DiSC Profilering</CardTitle>
          <CardDescription className="text-base">
            Indtast dit fulde navn for at logge ind eller oprette en profil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Input
            placeholder="Indtast dit fulde navn"
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
            {loading ? "Logger ind..." : "Log ind"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
