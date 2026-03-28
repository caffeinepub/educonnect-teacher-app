import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Dismissed in this session
    if (sessionStorage.getItem("teachment_install_dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const installedHandler = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("teachment_install_dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      data-ocid="install.panel"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-green-100 dark:border-green-900 overflow-hidden">
        {/* Green accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-green-500 to-emerald-400" />
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
            <img
              src="/assets/generated/teachment-icon-transparent.dim_128x128.png"
              alt="Teachment"
              className="w-6 h-6 object-contain"
            />
          </div>
          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              Install Teachment
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
              Add to home screen for quick access
            </p>
          </div>
          {/* Install button */}
          <button
            type="button"
            data-ocid="install.primary_button"
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shrink-0"
          >
            <Download size={13} />
            Install
          </button>
          {/* Dismiss */}
          <button
            type="button"
            data-ocid="install.close_button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0 ml-0.5"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
