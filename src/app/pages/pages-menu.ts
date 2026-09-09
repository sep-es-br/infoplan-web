import { NbMenuItem } from '@nebular/theme';
import { menulinks } from '../@core/utils/menuLinks';

export interface CustomNbMenuItem extends NbMenuItem {
  isExternalUrl?: boolean;
  separator?: boolean;
  sectionTitle?: string;
  id: number
}

export function buildMenuItems(): CustomNbMenuItem[] {
const dynamicMenuItems: CustomNbMenuItem[] = menulinks
  .filter(menu => menu.status) // Filtra apenas itens ativos
  .map(menu => ({
    title: menu.name,
    icon: { icon: menu.menuIcon || menu.icon.toString().split('.')[0], pack: 'custom-icons' },
    link: menu.link || undefined,
    url: menu.url || undefined,
    target: menu.url ? '_blank' : undefined,
    hidden: !menu.status,
    isExternalUrl: !!menu.url,
    id: menu.id,
    separator: menu.separator,
    sectionTitle: menu.sectionTitle,
    tooltip: menu.name
  }));

return [
  {
    title: 'Home',
    icon: 'home-outline',
    link: '/pages/home',
    isExternalUrl: false,
    id: 0,
  },
  ...dynamicMenuItems
];
}

export const MENU_ITEMS: CustomNbMenuItem[] = buildMenuItems();
