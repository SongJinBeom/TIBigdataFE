import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { MultiDataSet } from 'ng2-charts';
import { HttpClient } from '@angular/common/http';
import { IpService } from 'src/app/ip.service';
import { EPAuthService } from '../../../../core/componets/membership/auth.service';
import { ElasticsearchService } from "../../search/service/elasticsearch-service/elasticsearch.service";
import { IdControlService } from "../../search/service/id-control-service/id-control.service";
import { RecomandationService } from "../../search/service/recommandation-service/recommandation.service";


import { CloudData, CloudOptions } from "angular-tag-cloud-module";

import { thresholdSturges } from 'd3-array';
import { map } from "rxjs/operators";
import { ReturnStatement } from '@angular/compiler';
import { doc } from '../../library/category-graph/nodes';
import { inject } from '@angular/core/testing';
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})

export class DashboardComponent implements OnInit {


  constructor(
    private auth: EPAuthService,
    private http: HttpClient,
    private ipService: IpService,
    private es: ElasticsearchService,
    private idSvs : IdControlService,
    private rcmd : RecomandationService
  ) { }

  analysisList: string[] = ["TFIDF", "LDA", "Related Doc", "RNN"];
  graphList: string[] = ["Dounut", "Word-Cloud", "Bar", "Line"];
  docIdList : string[] = [
    "5de110274b79a29a5f987f1d",
    "5de1107f4b79a29a5f988202",
    "5de1109d582a23c9693cbec9",
    "5de110946669d72bad076d51",
    "5de113f4b53863d63aa55369"
  ]

  docTitleList = [];

  private tfidfDir : string = "../../../../../../assets/entire_tfidf/data.json";

  findDocName(){
    var docNum = this.docIdList.length;
     this.http.get(this.tfidfDir).subscribe(docData => {
        var temp;
        var sampleID;
        var sampleTitle;
        
        for (var j = 0; j<docNum;j++){
          sampleID = this.docIdList[j];

          for(var i = 0; i<545;i++){
            temp = docData[i]["docID"];

            if(temp==sampleID){
              sampleTitle = docData[i]["docTitle"];
              this.docTitleList[j]=sampleTitle;
            }
          }
        }
        console.log(this.docTitleList);
     })
  }

  //private hstReqUrl = this.ipService.getUserServerIp() + ":4000/hst/getTotalHistory";
  private hstFreq: any[];

  private hstReqUrl = this.ipService.getCommonIp() +":4000/hst/getTotalHistory";
  // private hstFreq : any[];
  
  private graphXData = [];
  private graphYData = [];
  private graphData = [];

  private ES_URL = "localhost:9200/nkdb";
  private myDocsTitles: string[] = [];
  private idList : string[] = [];
  private search_history = [];
  private chosenCount : number = 0;

  private choiceComplete = false;
  private userDataChoice = [];
  private userDocChoice = [];
  private userAnalysisChoice: string;
  private userGraphChoice: string;

  ngOnInit() {
    if (!this.auth.getLogInStat())
    alert("로그인이 필요한 서비스 입니다. 로그인 해주세요.");
    else {
      this.chosenCount = 0;
      this.idSvs.clearAll();
      console.log("dash board - page");
      this.convertID2Title().then(() => {
        console.log(this.myDocsTitles)
        this.queryHistory().then(() => {
          this.search_history.forEach(word => {
            this.graphData.push(word);
          });

          this.graphData.sort((a, b) => {
            return b.count - a.count;
          }); //count를 기준으로 정렬

          this.findTextData(this.graphXData);
          this.findCountData(this.graphYData);
          this.findTextData(this.search_history);
          console.log(this.search_history);
        });
      })
    }
  }


  async convertID2Title() {
    this.idList = await this.auth.getMyDocs() as string[];
    return new Promise((resolve) => {
      this.es.searchByManyId(this.idList).then(res=>{
        console.log(res);
        let articles = res["hits"]["hits"];
        for(let i = 0 ; i < articles.length; i++){
          this.myDocsTitles[i]=articles[i]["_source"]["post_title"][0]
        }
      })
      resolve();
      // this.http.post<any>()
    })
  }

  addList(i){
    this.idSvs.setIdList(this.idList[i]);
    this.chosenCount ++;
  }

  removeList(i){
    this.idSvs.popIdList();
    this.chosenCount --;
  }


  queryHistory() {
    return new Promise((r) => {
      this.http.get<any>(this.hstReqUrl)
        .subscribe((res) => {
          var hst = res.histories;
          var keyArr = hst.map((hstrs) => hstrs.keyword);
          var dateArr = hst.map((hstrs) => { hstrs.year, hstrs.month, hstrs.date });
          keyArr = keyArr.sort();
          //console.log("날짜 : " + dateArr);
          var lenArr = keyArr.length;
          var count = 1;
          var freqTable = [];
          var idxUniq = 0;
          for (var i = 0; i < lenArr - 1; i++) {
            if (keyArr[i] == keyArr[i + 1]) {
              count++; //빈도수 증가
              continue;
            }

            freqTable.push({ No: idxUniq, count: count, text: keyArr[i] });
            idxUniq++;
            count = 1;
          }
          this.hstFreq = freqTable;

          r();
        });
    });
  }


  ///// bar chart /////
  findTextData(textArr) {
    for (var i = 0; i < this.graphData.length; i++) {
      textArr[i] = this.graphData[i].text;
    }
  }

  findCountData(countArr) {
    for (var i = 0; i < this.graphData.length; i++) {
      countArr[i] = this.graphData[i].count;
    }
  }

  getUserChoice() {
    this.userDataChoice = this.search_history;
    //this.userAnalysisChoice = "";
    //this.userGraphChoice  = document.getElementById("g1");
  }

  showResult() {
    this.getUserChoice();
    this.choiceComplete = true;
    console.log("분석 : " + this.userAnalysisChoice + " 그래프 : " + this.userGraphChoice);
    this.rcmd.getRcmd(this.idList).then(data => {
      console.log(data);
    });
  }


  barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          max: 10,
          min: 0
        }
      }]
    }
  };

  barChartLabels: Label[] = this.graphXData;

  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];

  barChartData: ChartDataSets[] = [
    { data: this.graphYData, label: 'User Search History' }
  ];
  /////////////



  ///////// line chart /// 

  lineChartData: ChartDataSets[] = [
    { data: this.graphYData, label: '검색 추이' },
  ];

  lineChartLabels: Label[] = this.graphXData;

  lineChartOptions = {
    responsive: true,
  };

  lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgba(255,255,0,0.28)',
    },
  ];

  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';


  //////dounet chart ///
  doughnutChartOptions: ChartOptions = {
    responsive: true
  };
  public doughnutChartPlugins = [];
  doughnutChartLabels: Label[] = this.graphXData;
  doughnutChartData: MultiDataSet = [
    this.graphYData
  ];
  doughnutChartType: ChartType = 'doughnut';
  public doughnutChartColors = [
    {
      backgroundColor: [
        'rgba(255,0,0,0.3)',
        'rgba(0,255,0,0.3)',
        'rgba(0,0,255,0.3)'
      ]
    }
  ];



  //////////word
  options: CloudOptions = {
    // if width is between 0 and 1 it will be set to the size of the upper element multiplied by the value
    width: 1000,
    height: 250,
    overflow: true
  };

  cData: CloudData[] = []; 
  
 

  makeWordCloud(){
    var sample = this.graphData;


    for (let i in sample) {
      if (Number(i) >= 30) break;
      else if (Number(i) <= 4) {
        this.cData.push({
          text: sample[i][0],
          weight: sample[i][1],
          color: "blue"
        });
        // console.log(sample[i][1])
      } else
        this.cData.push({
          text: sample[i][0],
          weight: sample[i][1],
          color: "gray"
        });
    }


  }


  






}
