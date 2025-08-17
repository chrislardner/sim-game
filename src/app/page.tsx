"use client";

import HeroUltra from "@/components/about/Hero";
import InfoBar from "@/components/about/InfoBar";
import SectionDivider from "@/components/about/SectionDivider";
import FinePrint from "@/components/about/FinePrint";

export default function AboutPage() {
    return (
        <main className="min-h-screen">
            <HeroUltra />
            <SectionDivider className="my-8 md:my-10" />
            <InfoBar />
            <SectionDivider className="my-8 md:my-10" />
            <FinePrint email="me@example.com" />
        </main>
    );
}
