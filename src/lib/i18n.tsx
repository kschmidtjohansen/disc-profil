import React, { createContext, useContext, useState, ReactNode } from "react";
import { da } from "@/lib/translations/da";
import { en } from "@/lib/translations/en";
import { de } from "@/lib/translations/de";
import { es } from "@/lib/translations/es";
import { fr } from "@/lib/translations/fr";
import { nl } from "@/lib/translations/nl";
import { sv } from "@/lib/translations/sv";
import { no } from "@/lib/translations/no";
import { fi } from "@/lib/translations/fi";

export type Translations = typeof da;
export type Language = "da" | "en" | "de" | "es" | "fr" | "nl" | "sv" | "no" | "fi";

export const languages: { code: Language; label: string }[] = [
  { code: "da", label: "Dansk" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "fi", label: "Suomi" },
];

const translationsMap: Record<Language, Translations> = { da, en, de, es, fr, nl, sv, no, fi };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: "da",
  setLang: () => {},
  t: da,
});

export const useTranslation = () => useContext(I18nContext);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("disc_lang");
    return (stored as Language) || "da";
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem("disc_lang", l);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translationsMap[lang] }}>
      {children}
    </I18nContext.Provider>
  );
};
