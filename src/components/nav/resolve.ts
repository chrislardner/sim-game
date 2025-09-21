import type {NavItem, NavPage, NavSection} from "@/types/nav";

export function resolveHref(template: string, gameId: string, teamId?: string): string {
    if (teamId) {
        template = template.replace("{teamId}", teamId);
        template = template.replace("{id}", gameId);
        return template;
    }
    return template.replace("{id}", gameId);
}

export function resolveNav(items: NavItem[], gameId: string, teamId?: string): NavItem[] {
    return items.map((it) => {
        if (it.type === "page") {
            const page = it as NavPage;
            return {...page, hrefTemplate: resolveHref(page.hrefTemplate, gameId, teamId)};
        }
        const sec = it as NavSection;
        return {
            ...sec,
            children: sec.children.map((c) => ({
                ...c,
                hrefTemplate: resolveHref(c.hrefTemplate, gameId, teamId),
            })),
        };
    });
}