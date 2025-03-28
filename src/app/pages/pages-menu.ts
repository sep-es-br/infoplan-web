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

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Home',
    icon: 'home-outline',
    link: '/pages/home'
    
  },
  ...dynamicMenuItems,
 
];
