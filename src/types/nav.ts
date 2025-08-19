export type NavPage = {
    type: "page";
    label: string;
    hrefTemplate: string;
    exact?: boolean;
    newTab?: boolean;
    external?: boolean;
};

export type NavSection = {
    type: "section";
    label: string;
    children: NavPage[];
};

export type NavItem = NavPage | NavSection;
