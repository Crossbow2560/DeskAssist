import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>DeskAssist</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
