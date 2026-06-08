import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn, Lalezar } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const vazir = Vazirmatn({
    variable: "--font-vazir",
    subsets: ["arabic"],
    display: "swap",
});

const lalezar = Lalezar({
    weight: "400",
    variable: "--font-lalezar",
    subsets: ["arabic"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "هلدینگ نخلستان | Palm Grove",
    description: "خدمات دیجیتال، ریشه در خاک ایران.",
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const messages = await getMessages();

    // Dynamic class based on locale
    const dir = locale === 'fa' ? 'rtl' : 'ltr';
    const langClass = locale === 'fa' ? 'font-fa' : 'font-en';

    return (
        <html lang={locale} dir={dir}>
            <body className={`${geistSans.variable} ${geistMono.variable} ${vazir.variable} ${lalezar.variable} antialiased ${langClass} bg-palm-50 dark:bg-palm-950 text-palm-900 dark:text-palm-50`}>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
