// all types and interfaces

interface ISidebarMenuType {
    SidebarMenuHeadingProps: {
        title: string;
        light?: boolean;
    };
    SidebarMultimenuProps: { currentMenu: string; toggleMenu: (value: string) => void; title: string; Icon: JSX.IntrinsicElements; items: ItemType[]; premium?: boolean };
    SidebarItemProps: { title: string; Icon: JSX.IntrinsicElements; path: string };
}

export type ItemType = {
    title: string;
    path: string;
};

export interface IResponse {
    success: boolean;
    message: string;
}

export default SidebarMenuType;
