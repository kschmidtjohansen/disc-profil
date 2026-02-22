import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, RefreshCw, Clock } from "lucide-react";
import polygonLogo from "@/assets/polygon-logo.svg";

const PendingApproval = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.status === "approved") {
      navigate(user.role === "leader" ? "/dashboard" : "/disc-test");
    }
  }, [user, navigate]);

  if (!user) return null;

  const checkStatus = async () => {
    setChecking(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.status === "approved") {
        setUser({ ...user, status: "approved" });
        navigate(user.role === "leader" ? "/dashboard" : "/disc-test");
      }
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-xl">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto mb-2">
            <img src={polygonLogo} alt="Polygon Group" className="h-12 mx-auto" />
          </div>
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">{t.approval.pendingTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <p className="text-muted-foreground text-center leading-relaxed">
            {t.approval.pendingMessage.replace("{name}", user.full_name)}
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={checkStatus} disabled={checking} className="w-full h-12 rounded-xl">
              <RefreshCw className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              {t.approval.checkStatus}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="w-full h-12 rounded-xl">
              <LogOut className="mr-2 h-4 w-4" />
              {t.common.logout}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
