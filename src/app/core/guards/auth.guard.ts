import {
  CanActivateChildFn,
  UrlSegment,
  UrlSegmentGroup,
  UrlTree,
} from '@angular/router';

export const authGuard: CanActivateChildFn = (route, state) => {
  const storageToken = sessionStorage.getItem('token');

  if (!!storageToken) {
    return true;
  }

  const loginPageReroute = new UrlTree(
    new UrlSegmentGroup([], {
      primary: new UrlSegmentGroup([new UrlSegment('login', {})], {}),
    })
  );

  return loginPageReroute;
};
