import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
// import { map } from 'rxjs/operators';
import * as CanvasJS from "../../../../../../assets/canvasjs.min.js";
import { IpService } from 'src/app/ip.service'

@Component({
  selector: "app-search-history",
  templateUrl: "./search-history.component.html",
  styleUrls: ["./search-history.component.less"],
})
export class SearchHistoryComponent implements OnInit {

  constructor(private http: HttpClient, private ipService: IpService) { }
  private ALL_HST_REQ_URL = this.ipService.getUserServerIp() + ":4000/hst/getTotalHistory";
  private SORT_HST_FREQ_REQ_URL = this.ipService.getUserServerIp() + ":4000/hst/getSortFreqHistory";
  private MONTH_HST_FREQ_REQ_URL = this.ipService.getUserServerIp() + ":4000/hst/getMonthFreqHistory";

  private hstFreq: any[];
  private isChartReady: boolean = false;
  ngOnInit() {
    // this.getMonthtHistory();
    this.visualize(this.getSortHistory());
    // this.getSortHistory()
  }

  //get total history and how by ABC order
  queryTotalHistory() {
    return new Promise((r) => {
      this.http
        .get<any>(this.ALL_HST_REQ_URL)
        .subscribe((res) => {
          console.log(res);
          var hst = res.histories;
          var keyArr = hst.map((hstrs) => hstrs.keyword);
          keyArr = keyArr.sort();
          var lenArr = keyArr.length;
          var count = 1;
          var freqTable = [];
          var idxUniq = 0;
          for (var i = 0; i < lenArr - 1; i++) {
            if (keyArr[i] == keyArr[i + 1]) {
              count++;
              continue;
            }
            // freqTable.push(keyArr[i],count);
            freqTable.push({ x: idxUniq, y: count, label: keyArr[i] });
            idxUniq++;
            count = 1;
          }
          this.hstFreq = freqTable;

          r();
        });
    });

    // getTotalHistory
  }

  //get sorted history by frequency
  getSortHistory() {
    return new Promise((r) => {
      this.http
        .get<any>(this.SORT_HST_FREQ_REQ_URL)
        .subscribe((res) => {
          console.log(res);
          
          var freqTable = [];
          for (var i = 0; i < res.length; i++) {
            // res[i][0] //key
            // res[i][1] //freq
            freqTable.push({ x: i, y: res[i][1], label: res[i][0] });
          }
          this.hstFreq = freqTable;
          r();
        });
    });
  }//getSirtHistory()

   //get month history by frequency
   getMonthtHistory() {
    return new Promise((r) => {
      this.http
        .get<any>(this.MONTH_HST_FREQ_REQ_URL)
        .subscribe((res) => {
          console.log(res);
          /**
           * [
  [ 1, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 2, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 3, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 4, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 5, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 6, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 7, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 8, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 9, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 10, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 11, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ],
  [ 12, [ [keyword, freq], [keyword, freq], [keyword, freq] ] ]
]

           */
          var freqTable = [];
          let idx = 1;
          for (var i = 0; i < res.length; i++) {
            // res[i][0] //month
            // res[i][1] //keywords tuple array
            // res[i][1][0] //first tuple array
            // res[i][1][0][0] //first tuple array keword
            // res[i][1][0][1] //first tuple array keyword freq
            // res[i][1][1] //2nd tuple array
            // res[i][1][j] //(j-1)th tuple array
            let numKey = res[i][1].length;
            for(var j = 0 ; j < numKey; j++){
              let k = res[i][1][j][0];
              let f = res[i][1][j][1];
              console.log(i,"th month, key: ", k , ", freq : ", f);
              freqTable.push({ x: idx, y: f, label: i+1+"월 " +k });
              idx++;
            }
          }
          this.hstFreq = freqTable;
          r();
        });
    });
  }//getMonthtHistory()

  chooseTotal(){
    this.visualize(this.queryTotalHistory())
  }

  chooseMonthHst(){
    this.visualize(this.getMonthtHistory());
  }

  chooseTopXHst(){
    this.visualize(this.getSortHistory())
  }

  visualize(method){
    method.then(() => {
      // this.queryTotalHistory().then(() => {
        console.log("start hist")
        // console.log(this.hstFreq);
        let chart = new CanvasJS.Chart("chartContainer", {
          animationEnabled: true,
          title: {
            text: "지금까지 HOT 한 검색 결과",
          },
          axisY: {
            title: "검색 수",
            includeZero: false,
          },
          toolTip: {
            shared: true,
          },
          data: [
            {
              dataPoints:
                this.hstFreq
            },
          ],
        });
        this.isChartReady = true;
        chart.render();
        console.log(this.isChartReady)
      });
  }


}
