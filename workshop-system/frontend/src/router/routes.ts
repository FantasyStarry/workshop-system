import type { RouteObject } from 'react-router-dom';

export type AppRoute = RouteObject & {
  meta?: {
    title: string;
    icon?: React.ReactNode;
    hidden?: boolean;
    roles?: string[];
  };
  children?: AppRoute[];
};

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  roles?: string[];
}
