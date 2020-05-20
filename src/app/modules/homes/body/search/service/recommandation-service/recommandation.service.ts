import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IpService } from "src/app/ip.service";
import { Router } from "@angular/router";
// import { IdControlService } from "../id-control-service/id-control.service";
import { IdControlService } from '../id-control-service/id-control.service';

// import {SearchModule} from '../../search.module'

@Injectable({
  providedIn: "root"
})
export class RecomandationService {
  constructor(private ipService : IpService, private http: HttpClient,
  private _router : Router,
  private idControl : IdControlService) {}
  // private idList: string[] = [];
  private RCMD_URL: string = this.ipService.getUserServerIp() + ":5000/rcmd";
  private isInfoLoaded: boolean = false;
  rcmdList: {};
  private headers: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });

  getRcmd(idList:Array<string>) {
    // if(idList instanceof String) 
    // original code
    // this.http.post(this.RCMD_URL, { idList: this.idList }, { headers: this.headers })
    //   .subscribe(data => {
    //     this.rcmdList = data;
    //     // console.log(data);
    //     // this.isInfoLoaded = true;
    //     // console.log("isInfoLoaded is true");
    //     // console.log("getRcmd() done. loading done!");
    //   });

    // using observable
    // this.http.post(this.RCMD_URL, { idList: this.idList }, { headers: this.headers })
    //   .subscribe(data => {
    //     this.rcmdList = data;
    //   });

    // using promise
    return this.http.post(this.RCMD_URL, { idList: idList }, { headers: this.headers }).toPromise()

    // using promise directly with fs readFile.. but this is not a file system work...
    // this.http.post(this.RCMD_URL, { idList: this.idList }, { headers: this.headers })
    //   .subscribe(data => {
    //     this.rcmdList = data;
    //   });
  }

  // goToDoc(r : number){
  //   // this.rcmdList[i]["id"][r]
  //   // console.log(this.rcmdList[0]["id"][r]);
  //   this.idControl.setIdChosen(this.rcmdList[0]["id"][r]);
  //   this.navToDocDetail();

  //   // this.docId = this.article["_id"];
  //   // console.log(this.docId);
    
  // }

  // navToDocDetail() {
  //   this._router.navigateByUrl("search/DocDetail");
  // }
}
