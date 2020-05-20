import { Component, OnInit } from "@angular/core";
import { ElasticsearchService } from "../service/elasticsearch-service/elasticsearch.service";
import * as CanvasJS from "../../../../../../assets/canvasjs.min.js";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { IpService } from 'src/app/ip.service'

@Component({
  selector: "app-freq-analysis",
  templateUrl: "./freq-analysis.component.html",
  styleUrls: ["./freq-analysis.component.less"]
})
export class FreqAnalysisComponent implements OnInit {
  private searchKeyword;
  private URL = this.ipService.getUserServerIp() + ":5000/keywordGraph"

  private headers: HttpHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });
  constructor(private ipService : IpService, private http: HttpClient, private es: ElasticsearchService) {}

  ngOnInit() {
    this.searchKeyword = this.es.getKeyword();
    console.log("search keyword : "+this.searchKeyword);

    let body = { keyword: this.searchKeyword };

    this.http
      .post(this.URL, body, { headers: this.headers })
      .subscribe(data => {
        let chart = new CanvasJS.Chart("chartContainer", {
          animationEnabled: true,
          title: {
            text: "키워드 [" + this.searchKeyword + "] 에 대한 자료 수"
          },
          axisY: {
            title: "자료 수",
            includeZero: false
          },
          toolTip: {
            shared: true
          },
          data: [
            {
              type: "spline",
              name: "전체 자료 수",
              showInLegend: true,
              dataPoints: data[0]
            },
            {
              type: "spline",
              name: "검색 자료 수",
              showInLegend: true,
              dataPoints: data[1]
            }
          ]
        });

        chart.render();
      });
  }
}
