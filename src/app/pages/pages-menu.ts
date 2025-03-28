import { NbMenuItem } from '@nebular/theme';
import { menulinks } from '../@core/utils/menuLinks';

const dynamicMenuItems: NbMenuItem[] = menulinks.map(menu => ({
  title: menu.name,
  icon: { icon: menu.menuIcon || menu.icon.split('.')[0], pack: 'custom-icons' }, 
  link: menu.link || undefined,
  url: menu.url || undefined,
  target: menu.url ? '_blank' : undefined, 
  hidden: !menu.status,
}));

export interface CustomNbMenuItem extends NbMenuItem {
  isExternalUrl?: boolean;
}

export const MENU_ITEMS: CustomNbMenuItem[] = [
  {
    title: 'Home',
    icon: 'home-outline',
    link: '/pages/home',
    isExternalUrl: false
    
  },
  ...dynamicMenuItems.map(item => ({
    ...item,
    isExternalUrl: !!item.url
  })),
 
];
