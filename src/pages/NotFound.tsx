import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n";
import polygonLogo from "@/assets/polygon-logo.svg";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <img src={polygonLogo} alt="Polygon Group" className="h-10 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <p className="text-lg text-muted-foreground">{t.common.pageNotFound}</p>
        <a href="/" className="inline-block text-primary underline hover:text-primary/90">
          {t.common.returnHome}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
