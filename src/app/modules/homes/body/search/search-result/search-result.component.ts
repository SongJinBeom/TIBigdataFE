import {
  Component,
  OnInit,
  // ChangeDetectorRef,
  // Input,
  // Inject,
  // Output
} from "@angular/core";
import { Router } from "@angular/router";
import { ElasticsearchService } from "../service/elasticsearch-service/elasticsearch.service";
import { ArticleSource } from "../article/article.interface";
import { Subscription } from "rxjs";
// import { Observable, of } from "rxjs";
import { IdControlService } from "../service/id-control-service/id-control.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { IpService } from "src/app/ip.service";
import { RecomandationService } from "../service/recommandation-service/recommandation.service";
import { EPAuthService } from '../../../../core/componets/membership/auth.service';
import { EventService } from "../../../../core/componets/membership/event.service";


@Component({
  selector: "app-search-result",
  templateUrl: "./search-result.component.html",
  styleUrls: ["./search-result.component.less"]
})
export class SearchResultComponent implements OnInit {
  //Flask data
  // private BASE_URL: string = "http://localhost:5000/keywordGraph";
  // serverData: JSON;
  // private RCMD_URL: string = "http://localhost:5000/rcmd";
  // private static readonly INDEX = "nkdb";
  // private static readonly TYPE = "nkdb";
  // private queryText = "";
  // private lastKeypress = 0;
  // private thisURL: string = "http://localhost:4200/homes/searchResult";

  private fileDir: string =
    "assets//homes_search_result_wordcloud/tfidfData.json";
  public relatedKeywords = [];
  private RCMD_URL: string = this.ipService.getUserServerIp() + ":5000/rcmd";
  private idList: string[] = [];
  private rcmdList: {};
  private isSearchLoaded: boolean = false;
  private isRelatedLoaded : boolean = false;
  private isKeyLoaded: boolean = false;
  private headers: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });
  private articleSources: ArticleSource[];
  private docId: string;
  private isConnected = false;
  private status: string;
  private subscription: Subscription;
  private searchKeyword: string;
  // private isToggleRelated: boolean
  private relateToggle: Array<boolean>;
  private userHistory : [] = [];


  queryText: string;

  constructor(
    private auth : EPAuthService,
    private evtSvs : EventService,
    private rcmd: RecomandationService,
    private ipService: IpService,
    private idControl: IdControlService,
    public _router: Router,
    private http: HttpClient,
    private es: ElasticsearchService //private cd: ChangeDetectorRef
  ) {
    this.isConnected = false;
    this.subscription = this.es.articleInfo$.subscribe(info => {
      this.articleSources = info;
      // console.log(info)
    });
  }

  ngOnInit() {
    if (this.ipService.getUserServerIp() == this.ipService.getDevIp()) {
      if (this.es.getKeyword() == undefined) {
        this.es.setKeyword("북한산");
        this.queryText = "북한산";
      }
    }
    this.idControl.clearAll();
    console.log(this.evtSvs.getSrchHst());
    this.loadResultPage();
  }

  //Get result from flask
  freqAnalysis() {
    this.searchKeyword = this.es.getKeyword();
    this._router.navigateByUrl("search/freqAnalysis");
  }

  addList(i) {
    this.idControl.setIdList( this.idList[i] );
    // console.log("new id added to list! : " +     this.idList[i]  );
  }

  keepMyDoc(){
    console.log("id lists: ",this.idList);
    this.auth.addMyDoc(this.idList);
    this.idControl.clearAll();

  }
  //검색되어 나온 글들의 id 값을 array에 넣어줌

  // navToDataChart() {
  //   // console.log("cumulative id list so far : ");
  //   let v = this.idControl.getIdList();
  //   // console.log(v);
  //   this._router.navigateByUrl("search/ChosenDocAnalysis");
  // }

  navToDocDetail() {
    this._router.navigateByUrl("search/DocDetail");
  }

  // chooseDoc(i) {
  //   // this.idControl.clearIdChosen();
  //   // this.idControl.setArticle(this.articleSources[i]);
  //   this.idControl.setIdChosen(this.articleSources[i]["_id"]);
  //   this.navToDocDetail();
  // }
  setThisDoc(i: number, r: number) {
    // this.rcmdList[i]["id"][r];
    // console.log(this.rcmdList[i]["id"][r]);
    this.idControl.setIdChosen(this.rcmdList[i]["id"][r]);
    this.navToDocDetail();

    // this.docId = this.article["_id"];
    // console.log(this.docId);
  }
  tgglRelated(i: number) {
    // console.log("tgglRelated")
    this.relateToggle[i] = !this.relateToggle[i];

    // this.idControl.clearIdChosen();
    // this.idControl.setArticle(this.articleSources[i]);
    // this.idControl.setIdChosen(this.articleSources[i]["_id"]);
    // this.navToDocDetail();
  }

  private keywords: any[];
  //aync가 의미하듯이, 비공기의 범위는 해당 함수까지만 이다.
  //toPromise도 비동기이다. toPromise 혹은 subscribe을 만나면, 비동기는 비동기대로 하고, 나머지는 건너뛴다.
  /***
   * A()
   * new Promise(r()=>B();...).then(C();)
   * D();
   * E();
   *
   * 이렇게 되어 있다면
   * A  -> B -> C
   *    -> D -> E
   * 이렇게 병렬적으로 실행된다.
   * 멀티프로세싱 혹은 시리즈 프로세싱...
   */
  loadKeywords() {
    return new Promise(async resolve => {
      let tfidfData = (await this.http.get(this.fileDir).toPromise()) as [];
      // tfidfData
      this.keywords = [];

      for (var j = 0; j < this.idList.length; j++) {
        let needData = {};
        needData = tfidfData.find(d => d["docID"] === this.idList[j]);

        try {
          let tfVal = needData["TFIDF"];

          const kwd = [] as any;
          let word;
          for (var k = 0; k < 3; k++) {
            word = tfVal[k][0];
            kwd.push(word);
          }
          this.keywords.push(kwd);
        } catch {
          // console.log("error at index " + j);
          // console.log("obejct detail : " + needData);
          // console.log("looking for : ", tfData[j]["docID"]);
        }
      }
      resolve();
      // console.log("loadKeywords");
    });
  }
  makeRelatedKey() {
    this.relatedKeywords = [];

    let keys = this.keywords;
    let count = 0;
    for (let i = 0; i < keys.length; i++) {
      // console.log(this.keywords[i])
      for (let j = 0; j < keys[i].length; j++) {
        this.relatedKeywords.push(keys[i][j]);
        count++;
        if (count > 5) break;
      }
      if (count > 5) break;
    }
    this.relatedKeywords = Array.from(new Set(this.relatedKeywords));
    this.isKeyLoaded = true;
  }

  loadRelatedDocs() {
    // console.log("loadRelatedDocs");

    // console.log(this.idList);
    this.rcmd.getRcmd(this.idList).then(data => {
      // console.log("getRcmd");

      // console.log(data);
      // console.log(typeof data);
      this.rcmdList = data;
      console.log(data);
      this.isRelatedLoaded = true;
    });
  }

  relatedSearch(keyword: string) {
    this.es.setKeyword(keyword);
    this.queryText = keyword;
    this.auth.addSrchHst(this.queryText);

    this.loadResultPage();
  }

  loadSearchResult() {
    // console.log("loadSearchResult");

    return new Promise(resolve => {
      this.es.articleInfo$.subscribe(articles => {
        this.articleSources = articles;
        this.isSearchLoaded = true;
        resolve();
      });
    });
  }

  createIdTable() {
    let temp = this.articleSources as []; //검색된 데이터들을 받음
    this.relateToggle = []; //연관 문서 여닫는 버튼 토글 초기화
    for (var i in temp) {
      this.idList[i] = temp[i]["_id"];
      this.relateToggle.push(false);
    }
    // console.log("createTable");

    // console.log(this.idList);
  }

  async loadResultPage() {
    this.isSearchLoaded = false;
    this.isKeyLoaded = false;
    this.isRelatedLoaded = false;

    this.idControl.clearIdList();
    this.idList = [];

    let queryText = this.es.getKeyword();
    this.es.fullTextSearch("post_body", queryText); //검색 후 articlesource에 저장되어 있다.


    //검색한 결과 호출하는 함수를 따로 만들어도 괜찮을 듯.
    await this.loadSearchResult();
    this.createIdTable();

    //ready each independently after id table  => multi process
    this.loadKeywords().then(() => {//load from tfidf table
      this.makeRelatedKey();//ready only after loadKeyworkds
      console.log("비동기 테스트 1");
      
    });
    console.log("비동기 테스트 2");
    
    //연관문서 속도는 미들웨어에서 프로그램 실행할 때
    //load한 상태로 데이터를 로드한 상태를 유지하는 것으로 해결
    this.loadRelatedDocs(); //load from flask
  }
}
