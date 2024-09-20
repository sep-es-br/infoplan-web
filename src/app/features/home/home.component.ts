import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { menulinks } from '../../@core/utils/menuLinks';

@Component({
  selector: 'ngx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public menulinks = menulinks;

  constructor(private router: Router) { 
  }

  ngOnInit(): void {
  }

  handleClick(id: number) {
    const menuClicked = menulinks[id-1];
    if(menuClicked.link != ''){
      this.router.navigate([menuClicked.link]);
    }else{
      if(menuClicked.url != ''){
        window.open(menuClicked.url, '_blank');
      }
    }
  }

}
