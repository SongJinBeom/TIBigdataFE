import { Injectable, Injector } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { IpService } from 'src/app/ip.service'

import {
  AuthService,
  SocialUser,
  GoogleLoginProvider,
} from "angularx-social-login";

//enumerate login status
enum logStat {
  unsigned,//0
  SUPERUSER,//1
  email,//2
  google,//3
}


/**
 * Token stored in front end browser.
 * check login type among email, google, facebook, etc...
 * check token value.
 */
class storeToken {
  //property coverage should be considered more... use private?
  type: logStat;
  token: string;

  constructor(type: logStat, token: string) {
    this.type = type;
    this.token = token
  }
}

@Injectable({
  providedIn: "root",
})
export class EPAuthService {
  private JC: string = "jcnam@handong.edu";
  private BAEK: string = "21500850@handong.edu";
  private SONG: string = "21500831@handong.edu";


  private URL = this.ipService.getUserServerIp();


  private EMAIL_REG_URL = this.URL + ":4000/eUser/register"; //mongoDB
  private EMAIL_LOGIN_URL = this.URL + ":4000/eUser/login";
  private EMAIL_VERIFY_TOKEN = this.URL + ":4000/eUser/verify";
  private EMAIL_CHECK_OUR_USER_URL = this.URL + ":4000/eUser/eCheckUser";

  private GOOGLE_REG_URL = this.URL + ":4000/gUser/gRegister";
  private GOOGLE_CHECK_OUR_USER_URL = this.URL + ":4000/gUser/gCheckUser";
  private GOOGLE_VERIFY_TOKEN_URL = this.URL + ":4000/gUser/verifyGoogleToken";

  private KEEP_MY_DOC_URL = this.URL + ":4000/myDoc/keepMyDoc";
  private GET_MY_DOC_URL = this.URL + ":4000/myDoc/getMyDoc";

  private ADD_SEARCH_HISTORY_URL = this.URL + ":4000/hst/addHistory";
  private SHOW_SEARCH_HISTORY_URL = this.URL + ":4000/hst/showHistory"

  private isLogIn: logStat = logStat.unsigned;//for static, inactive, passive use
  private isLogInObs$: BehaviorSubject<logStat> = new BehaviorSubject(logStat.unsigned);//to stream to subscribers
  private loginUserData = {};
  private socUser: SocialUser = null;//for social login
  private profile: {//for user profile
    name: String,
    email: String,
    history?: []
  };
  private schHst: [] = [];//user search history
  private myDocs: [] = [];
  constructor(
    private ipService: IpService,
    private injector: Injector,
    private http: HttpClient,
    private router: Router,
    private gauth: AuthService,
  ) {
    // this.isLogInObs$.next(logStat.unsigned);
  }


  forceLogOut() {
    alert("강제로 로그아웃 합니다. 새로고침 해야 적용 됨.");
    localStorage.removeItem("token");
  }



  /**
   * @CommonUserLoginFunctions
   * @description common login process for all login methods such as email, gmail, ...  
   */
  //check login state
  getLogInObs(): Observable<logStat> {
    return this.isLogInObs$;
  }

  getLogInStat(): logStat {
    return this.isLogIn;
  }
  setLogStat(stat) {
    this.isLogIn = stat as logStat;
  }

  getUserName(): String {
    return this.profile.name;
  }

  // getLogInStatObs() {//return type be logStat
  //   // var stat;
  //   return new Promise((resolve)=>{
  //     this.isLogInObs$.subscribe((res)=>{
  //       resolve(res)
  //     })
  //   })//그리고 나서 then((r)=>this.stat = r; if(this.stat == ... ){ ...})
  //   // return this.isLogInObs$.toPromise().then((res)=>res as logStat);
  //   // return
  //   // console.log(stat)
  //   // return this.isLogIn;
  // }

  // async logOutObs(){
  //   var stat = await this.getLogInStatObs();
  //     if (stat == logStat.email)
  //     this.eLogoutUser()
  //     else if(stat == logStat.google)
  //     this.gSignOut();

  //     if(stat == logStat.unsigned)
  //     new Error("logStat screwed up. need to be checked.");//in case of screwed up
  //     this.isLogInObs$.next(logStat.unsigned)
  //     this.router.navigate(["/homes"]);
  // }




  //get current token in this present browser.
  getToken() {
    return localStorage.getItem("token");
  }

  getNowUser(): SocialUser {
    return this.socUser;
  }

  //logout function for all login methods
  logOut() {

    if (this.isLogIn == logStat.email)
      this.eLogoutUser()
    else if (this.isLogIn == logStat.google)
      this.gSignOut();
    localStorage.removeItem("token");

    if (this.isLogIn == logStat.unsigned)
      new Error("logStat screwed up. need to be checked.");//in case of screwed up
    this.isLogInObs$.next(logStat.unsigned)
    this.router.navigate(["/homes"]);
  }


  //Check if this user has token, and if the token is valid.
  //called in the main home page.
  //When a user re-visit our app, should verify if token is valid
  // to decide the nav bar user name and user status.
  verifySignIn() {
    var isSignIn: boolean = false;
    var tk_with_type = JSON.parse(this.getToken());//token is stored in string.

    if (tk_with_type) {//when token exists
      var tk = tk_with_type.token;
      var type = tk_with_type.type;
      console.log("Token found! : ", tk_with_type);

      if (type == logStat.google) {
        console.log("token is from google");
        var gTkRes$ = this.gVerifyToken(tk);//verify it this token is valid or expired.
        gTkRes$.subscribe(
          tkStat => {
            console.log(tkStat);
            if (tkStat.status) {//if token is valid
              this.socUser = tkStat.user;
              var n = this.socUser.name;
              var e = this.socUser.email;
              this.profile = { name: n, email: e };//profile property is used to show in nav bar.
              if (this.profile.email === this.JC || this.profile.email === this.BAEK || this.profile.email === this.SONG) {
                this.isLogIn = logStat.SUPERUSER;
              }
              else {
                this.isLogIn = logStat.google;//update token status 
              }
              console.log("token verify succ");
              this.isLogInObs$.next(this.isLogIn);//send the news that token status is updated to other components
            }
            else {
              console.log("token verify fail");
            }
          },
          err => {
            console.log('error occurs! not google user : ', err);
          },
        );
      }

      else if (type == logStat.email) {
        console.log("token is from email");
        var eTkRes$ = this.eVerifyToken(tk);
        eTkRes$.subscribe(
          res => {
            if (res.succ) {//token verify success
              // console.log(res);
              // else {
              //   this.isLogIn = logStat.google;//update token status 
              // }
              this.isLogIn = logStat.email;
              this.profile = { name: res.payload.name, email: res.payload.email };
              if (this.profile.email === this.JC || this.profile.email === this.BAEK || this.profile.email === this.SONG) {
                this.isLogIn = logStat.SUPERUSER;
              }
              // console.log(this.profile);

              this.isLogInObs$.next(this.isLogIn);
            }
            else {//toekn verify failed
              if (res.msg == "expired") {
                alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                this.eLogoutUser();
                this.router.navigate(['/homes']);
              }
            }
          },
          err => {
            console.log('error occurs! not email user : ', err);
          }
        )

      }
    }

    else {//when token does not exist.
      console.log("token is not found. Hello, newbie!");
      console.log("check the login stat as well : ", this.isLogIn);
      return isSignIn;
    }
  }
  //검색내역 history 추가 
  addSrchHst(keyword: string): void {
    // console.log(this.socUser);
    let userEmail = undefined;


    let bundle;
    if (this.isLogIn)
      userEmail = this.profile.email;
    bundle = { login: this.isLogIn, user: userEmail, key: keyword }
    this.http.post<any>(this.ADD_SEARCH_HISTORY_URL, bundle).subscribe((res) => {
      console.log("history added raw result : ", res);
      this.schHst = res.history;
      console.log("personal history : ", this.schHst);
    });
  }

  showSrchHst(): Promise<any> {
    var hst;
    return new Promise((resolve) => {
      this.http.get<any>(this.SHOW_SEARCH_HISTORY_URL)
        .subscribe((res) => {
          hst = res.history;
        });
    }
    )

  }

  addMyDoc(docIDs) {
    let payload = { userEmail: this.profile.email, docs: docIDs };
    console.log("keep doc sending data : ", payload);
    this.http.post<any>(this.KEEP_MY_DOC_URL, payload).subscribe((res) => {
      console.log(res);
      this.myDocs = res.myDoc;
    })
  }

  getMyDocs() {
    console.log("this.profile.email",this.profile.email);
    return new Promise((r) => {
      this.http.post<any>(this.GET_MY_DOC_URL, {payload : this.profile.email}).subscribe((res) => {
        console.log("angular get mydocs result : ",res);
        r(res.docs);
      });
    })
  }

  // keepMyDoc(){
  //   this.htp.post<any>()
  // }




  /***
   * @EmailUserLoginFunctinos
   * @description email login functions
   *  functions:
   */

  //email user : check if this user is already our user
  async eCheckUser(user: {}): Promise<any> {
    let isOurUser = await this.http.post<any>(this.EMAIL_CHECK_OUR_USER_URL, user).toPromise();

    return isOurUser;
  }


  //email registration function
  async eRegisterUser(user): Promise<any> {
    console.log("user reg input : ", user);

    // let isOurUser$ = this.eCheckUser(user);
    // let res = await isOurUser$.toPromise();
    let isOurUser = await this.eCheckUser(user);
    console.log(isOurUser);
    if (isOurUser.succ) {//if this user is one of us, deny registration.
      alert("이미 등록되어 있는 id 입니다. 로그인 페이지로 이동합니다.");
      //비밀번호 찾기 페이지도 만들어야 한다. 
      this.router.navigateByUrl("/membership/login");
    }
    else {
      this.http.post<any>(this.EMAIL_REG_URL, user)
        .subscribe(//perhaps return observable with response.
          res => {
            // console.log(res)
            this.confirmUser(logStat.email, res);
            alert("반갑습니다." + res.payload.name + "님. 홈 화면으로 이동합니다.");
          },
          err => console.log(err)
        )
    }

  }

  //email sign in function
  async eLoginUser(user): Promise<any> {
    console.log("login req user : ", user);

    let isOurUser = await this.eCheckUser(user);
    console.log(isOurUser);
    if (!isOurUser.succ) {//if this user is one of us, deny registration.
      alert("아직 KUBiC 회원이 아니시군요? 회원가입 해주세요! :)");
      //비밀번호 찾기 페이지도 만들어야 한다. 
    }
    else {
      console.log("user input check : ", user);
      var result$ = this.http.post<any>(this.EMAIL_LOGIN_URL, user);
      result$.subscribe(
        res => {
          console.log("login process result : ", res);
          // login succ
          if (res.succ)
            this.confirmUser(logStat.email, res);
          //login fail. maybe wrong password or id?
          if (!res.succ)
            alert("이메일 혹은 비밀번호가 잘못되었어요.");
        },
        err => {
          console.log(err)
        }
      )
    }
  }

  confirmUser(stat: logStat, res): void {
    console.log(res);
    this.isLogIn = stat;
    localStorage.setItem('token', JSON.stringify(new storeToken(stat, res.payload.token)));
    if (stat === logStat.email)
      this.profile = { name: res.payload.name, email: res.payload.email };
    else { }//user for google. coupling for flexibility.
    this.router.navigate(['/homes']);
  }

  //email sign out function
  eLogoutUser(): void {
    localStorage.removeItem("token");
    // this.router.navigate(["/homes"]);
  }

  //email verify token
  eVerifyToken(token): Observable<any> {
    return this.http.post<any>(this.EMAIL_VERIFY_TOKEN, token);
  }




  /**
   * @GoogleSocialLogin
   * Google Social Login functions
   * Functions : login, checkUSer, register, signout, verify token
   */

  /**
   * @function gLogIn
   * @param platform 
   * @description user login with google social login
   */
  async gLogIn() {
    let response = await this.verifyGoogleUser();
    //check if this user is our user already
    this.gCheckUser(response).subscribe((res) => {

      if (res.exist == false) {
        if (!res.exist) {
          console.log("This user is not yet our user : need sign up : ", res);
          alert("아직 KUBiC 회원이 아니시군요?\n 반갑습니다!\n 회원가입 페이지로 이동합니다. :)");
          this.router.navigateByUrl("/membership/register");
        }

      }
      else {
        console.log("This user is already our user!");
        this.socUser = response as SocialUser;
        console.log(this.socUser);
        localStorage.setItem('token', JSON.stringify(new storeToken(logStat.google, this.socUser.idToken)));

        // localStorage.setItem('token',this.socUser.idToken);
        console.log("login user info saved : ", this.socUser);
        this.isLogIn = logStat.google;
        this.router.navigate(['/homes'])
      }
    }
    );
  }

  verifyGoogleUser() {
    let platform = GoogleLoginProvider.PROVIDER_ID;
    return new Promise((resolve) => {
      this.gauth.signIn(platform).then((response) => {//error branch 추가할 필요성 있음...
        resolve(response);
      })
    })

  }

  /**
   * @function gCheckUser 
   * @param user
   * @description check if this user is already our user. check out from the DB. 
   */
  gCheckUser(user: {}): Observable<any> {
    return this.http.post<any>(this.GOOGLE_CHECK_OUR_USER_URL, user);
  }

  gRegisterUser(user: {}): Observable<any> {
    return this.http.post<any>(this.GOOGLE_REG_URL, user);
  }

  gSignOut(): void {
    localStorage.removeItem("token");
    this.gauth.signOut();
    // this.isLogIn = logStat.unsigned;
  }

  //verify if this token is from google
  gVerifyToken(token: string): Observable<any> {
    var client = this.injector.get("GOOGLE PROVIDER ID");//get google api client id from angular injector
    // console.log(client);
    return this.http.post<any>(this.GOOGLE_VERIFY_TOKEN_URL, { token: token, client: client });
  }

}
