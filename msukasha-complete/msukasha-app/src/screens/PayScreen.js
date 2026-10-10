import React from "react";
import { WebView } from "react-native-webview";

// Auto-submits the signed JazzCash form inside a WebView.
export default function PayScreen({ route, navigation }) {
  const { url, fields } = route.params.payload;
  const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const inputs = Object.entries(fields).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("");
  const html = `<html><body onload="document.forms[0].submit()"><p style="font-family:sans-serif;text-align:center;margin-top:40px">Redirecting to JazzCash…</p><form method="POST" action="${esc(url)}">${inputs}</form></body></html>`;
  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html, baseUrl: "https://msukasha.com" }}
      onNavigationStateChange={(s) => { if (/payments\/jazzcash\/callback/.test(s.url) && !s.loading) setTimeout(() => navigation.goBack(), 2500); }}
    />
  );
}
