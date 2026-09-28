"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#fafafa", color: "#171717" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Critical error</h1>
          <p style={{ marginTop: 12, maxWidth: 420, color: "#737373" }}>
            Something went wrong rendering the application. Please reload the page to continue.
          </p>
          {error?.digest && <p style={{ marginTop: 8, fontSize: 12, color: "#a3a3a3" }}>Reference: {error.digest}</p>}
          <button
            onClick={reset}
            style={{ marginTop: 24, background: "#171717", color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}
