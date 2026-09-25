import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "شهّر | منصة توثيق الوثائق والشهادات",
  description:
    "منصة شهّر لإصدار الوثائق والشهادات الإلكترونية والتحقق من صحتها عبر رقم مرجعي أو رمز QR — نظام توثيق موثوق وسريع.",
  keywords: ["توثيق", "شهادات", "التحقق", "وثائق", "شهّر", "Shaher Verify"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230f766e'/><text x='50' y='68' font-size='55' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='bold'>ش</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${tajawal.variable} font-tajawal antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
