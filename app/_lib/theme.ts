export type Theme = "light" | "dark";

export const themeStorageKey = "applyflow-theme";

// Runs in the document head before paint, so a saved dark theme never flashes light.
export const themeScript = `(() => {
    let theme;
    try { theme = localStorage.getItem("${themeStorageKey}"); } catch {}
    const dark = theme === "dark" || (theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
})();`;
