import type { NavItem, NavPage, NavSection } from "@/types/nav";

export function resolveHref(template: string, gameId: string) {
    return template.replace("{id}", gameId);
}

export function resolveNav(items: NavItem[], gameId: string): NavItem[] {
    return items.map((it) => {
        if (it.type === "page") {
            const page = it as NavPage;
            return { ...page, hrefTemplate: resolveHref(page.hrefTemplate, gameId) };
        }
        const sec = it as NavSection;
        return {
            ...sec,
            children: sec.children.map((c) => ({
                ...c,
                hrefTemplate: resolveHref(c.hrefTemplate, gameId),
            })),
        };
    });
}
