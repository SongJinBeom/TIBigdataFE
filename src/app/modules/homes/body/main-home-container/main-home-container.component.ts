import { Component, OnInit } from '@angular/core';
import { EPAuthService } from '../../../core/componets/membership/auth.service';
import {AuthService} from 'angularx-social-login'

@Component({
  selector: 'app-main-home-container',
  templateUrl: './main-home-container.component.html',
  styleUrls: ['./main-home-container.component.less']
})
export class MainHomeContainerComponent implements OnInit {

  constructor(private auth : EPAuthService, private gAuth : AuthService ) { }

  ngOnInit() {
    // console.log("main home arrived");
    this.auth.verifySignIn();//어디 갔다가 다시 웹사이트에 돌아왔을 때, 그 때 파악하는 용도.
  }

}
