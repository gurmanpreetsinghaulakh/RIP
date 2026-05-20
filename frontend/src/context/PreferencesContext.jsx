import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const PreferencesContext = createContext(null);

// Fallback rates if API fails (Base: INR)
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
};

const SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

// Simple dictionary for basic translations
const DICTIONARY = {
  English: {
    "nav.explore": "Explore",
    "nav.saved": "Saved",
    "nav.profile": "Profile",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.admin": "Admin",
    "profile.settings": "Profile Settings",
    "profile.personal_info": "Personal Info",
    "profile.security": "Security",
    "profile.preferences": "Preferences",
    "profile.save": "Save Changes",
    "profile.display_name": "Display Name",
    "profile.email": "Email Address",
    "profile.about": "About You",
    "profile.phone": "Phone Number",
    "profile.location": "Current Location",
    "profile.language": "Language",
    "profile.currency": "Currency",
    "profile.notifications": "Email Notifications",
  },
  Hindi: {
    "nav.explore": "खोजें",
    "nav.saved": "सहेजा गया",
    "nav.profile": "प्रोफ़ाइल",
    "nav.login": "लॉग इन करें",
    "nav.signup": "साइन अप",
    "nav.admin": "एडमिन",
    "profile.settings": "प्रोफ़ाइल सेटिंग्स",
    "profile.personal_info": "व्यक्तिगत जानकारी",
    "profile.security": "सुरक्षा",
    "profile.preferences": "प्राथमिकताएं",
    "profile.save": "परिवर्तन सहेजें",
    "profile.display_name": "प्रदर्शन नाम",
    "profile.email": "ईमेल पता",
    "profile.about": "आपके बारे में",
    "profile.phone": "फ़ोन नंबर",
    "profile.location": "वर्तमान स्थान",
    "profile.language": "भाषा",
    "profile.currency": "मुद्रा",
    "profile.notifications": "ईमेल सूचनाएं",
  },
  Spanish: {
    "nav.explore": "Explorar",
    "nav.saved": "Guardado",
    "nav.profile": "Perfil",
    "nav.login": "Acceso",
    "nav.signup": "Inscribirse",
    "nav.admin": "Administración",
    "profile.settings": "Configuración de perfil",
    "profile.personal_info": "Información personal",
    "profile.security": "Seguridad",
    "profile.preferences": "Preferencias",
    "profile.save": "Guardar cambios",
    "profile.display_name": "Nombre para mostrar",
    "profile.email": "Dirección de correo electrónico",
    "profile.about": "Acerca de ti",
    "profile.phone": "Número de teléfono",
    "profile.location": "Ubicación actual",
    "profile.language": "Idioma",
    "profile.currency": "Moneda",
    "profile.notifications": "Notificaciones por correo",
    "profile.preferences": "Preferencias",
    "nav.explore": "Explorer",
    "nav.saved": "Enregistré",
    "nav.profile": "Profil",
    "nav.login": "Connexion",
    "nav.signup": "S'inscrire",
    "nav.admin": "Administrateur",
    "profile.settings": "Paramètres du profil",
    "profile.personal_info": "Informations personnelles",
    "profile.security": "Sécurité",
    "profile.preferences": "Préférences",
    "profile.save": "Enregistrer",
    "profile.display_name": "Nom d'affichage",
    "profile.email": "Adresse e-mail",
    "profile.about": "À propos de vous",
    "profile.phone": "Numéro de téléphone",
    "profile.location": "Localisation actuelle",
    "profile.language": "Langue",
    "profile.currency": "Devise",
    "profile.notifications": "Notifications par e-mail",
  },
};

const DEFAULT_ADMIN_SETTINGS = {
  siteName: "HomiGo",
  tagline: "Your home away from home.",
  contactEmail: "support@homigo.com",
  currency: "INR",
  minListingImages: 4,
  maxListingImages: 5,
  minNights: 1,
  maxNights: 30,
  enableReviews: true,
  enableBookings: false,
  requireEmailVerification: false,
  maintenanceMode: false,
  defaultCategory: "Stay",
  commissionRate: 10,
  maxPriceLimit: 100000,
  language: "English",
};

const mapLanguage = (lang) => {
  return "English";
};

export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [adminSettings, setAdminSettings] = useState(() => {
    const stored = localStorage.getItem("homigo_admin_settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.language) parsed.language = mapLanguage(parsed.language);
        return { ...DEFAULT_ADMIN_SETTINGS, ...parsed };
      } catch {
        return DEFAULT_ADMIN_SETTINGS;
      }
    }
    return DEFAULT_ADMIN_SETTINGS;
  });

  useEffect(() => {
    const adminStored = localStorage.getItem("homigo_admin_settings");
    let initialCurrency = "INR";
    let initialLanguage = "English";

    if (adminStored) {
      try {
        const parsed = JSON.parse(adminStored);
        if (parsed.currency) initialCurrency = parsed.currency;
        if (parsed.language) initialLanguage = mapLanguage(parsed.language);
      } catch {}
    }

    if (user) {
      const storedProfile = localStorage.getItem(
        `homigo_user_profile_${user.email}`,
      );
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed.currency) initialCurrency = parsed.currency;
          if (parsed.language) initialLanguage = mapLanguage(parsed.language);
        } catch {}
      } else {
        const savedCurrency = localStorage.getItem("homigo_currency");
        const savedLanguage = localStorage.getItem("homigo_language");
        if (savedCurrency) initialCurrency = savedCurrency;
        if (savedLanguage) initialLanguage = savedLanguage;
      }
    }

    setCurrency(initialCurrency);
    setLanguage(initialLanguage);
  }, [user]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/INR",
        );
        if (!res.ok) throw new Error("Primary API failed");
        const data = await res.json();
        if (data && data.rates) {
          setRates(data.rates);
          return;
        }
      } catch (error) {
        console.warn(
          "Failed to fetch from primary rate API, trying fallback API:",
          error,
        );
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/INR");
          const data = await res.json();
          if (data && data.rates) {
            setRates(data.rates);
            return;
          }
        } catch (fallbackError) {
          console.error(
            "All exchange rate APIs failed, using local fallbacks:",
            fallbackError,
          );
        }
      }
    };
    fetchRates();
  }, []);

  const updatePreferences = (newCurrency, newLanguage) => {
    if (newCurrency) {
      setCurrency(newCurrency);
      localStorage.setItem("homigo_currency", newCurrency);
    }
    setLanguage("English");
    localStorage.setItem("homigo_language", "English");
  };

  const updateAdminSettings = (newSettings) => {
    const updated = { ...adminSettings, ...newSettings, language: "English" };
    setAdminSettings(updated);
    localStorage.setItem("homigo_admin_settings", JSON.stringify(updated));

    // Also sync the preferences context if they changed
    if (newSettings.currency) {
      setCurrency(newSettings.currency);
      localStorage.setItem("homigo_currency", newSettings.currency);
    }
    setLanguage("English");
    localStorage.setItem("homigo_language", "English");
  };

  const formatPrice = useCallback(
    (amountInINR) => {
      if (!amountInINR) amountInINR = 0;
      const rate = rates[currency] || FALLBACK_RATES[currency] || 1;
      const converted = amountInINR * rate;
      const symbol = SYMBOLS[currency] || "₹";

      // Custom formatting logic to handle large numbers cleanly based on locale
      let locale = "en-IN";
      if (currency === "USD") locale = "en-US";
      if (currency === "EUR") locale = "de-DE";
      if (currency === "GBP") locale = "en-GB";

      return `${symbol}${converted.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
    },
    [currency, rates],
  );

  const t = useCallback(
    (key) => {
      const langDict = DICTIONARY[language] || DICTIONARY["English"];
      return langDict[key] || DICTIONARY["English"][key] || key;
    },
    [language],
  );

  return (
    <PreferencesContext.Provider
      value={{
        currency,
        language,
        formatPrice,
        t,
        updatePreferences,
        adminSettings,
        updateAdminSettings,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
