export type NavPage = {
    type: "page";
    label: string;
    hrefTemplate: string;
};

export type NavSection = {
    type: "section";
    label: string;
    children: NavPage[];
};

export type NavItem = NavPage | NavSection;
