import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/service/authentication.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit  {

  showExitButton: boolean = false;

  constructor(private authenticationService: AuthenticationService ,private toastrService: NbToastrService, private router: Router) { 
  }

  ngOnInit(): void {
    const state = window.history.state as { authError: string };
    if (state?.authError) {
      this.toastrService.show(state.authError, 'Atenção', { status: 'warning', duration: 8000 });
      this.showExitButton = true;
    }
  }

  login(){
  this.authenticationService.acessoCidadaoSignIn();
  }

  logout() {
    window.location.href = 'https://acessocidadao.es.gov.br/is/logout';
  }

}
