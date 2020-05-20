import { Component, OnInit } from '@angular/core';

import { HttpClient, HttpHeaders} from '@angular/common/http';
import { CloudData, CloudOptions } from 'angular-tag-cloud-module';
import { ElasticsearchService } from '../../body/search/service/elasticsearch-service/elasticsearch.service';
import * as CanvasJS from '../../../../../assets/canvasjs.min.js';
import { IpService } from 'src/app/ip.service'

import { Observable, of} from 'rxjs';

@Component({
  selector: 'app-flask',
  templateUrl: './flask.component.html',
  styleUrls: ['./flask.component.less']
})
export class FlaskComponent implements OnInit {
  private URL = this.ipService.getUserServerIp();
  private BASE_URL: string = this.URL+':5000/wordrank';
  private TEST_URL: string = this.URL+':5000/test';


  private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
  serverData: JSON;
  employeeData: JSON;
  searchKeyword;

  constructor(private ipService : IpService,private http:HttpClient, private es: ElasticsearchService) { }


  options: CloudOptions = {
    // if width is between 0 and 1 it will be set to the size of the upper element multiplied by the value 
    width: 1000,
    height: 400,
    overflow: true,
  };

  cData: CloudData[] = [];
  
 
  ngOnInit() {

    this.http.get(this.BASE_URL).subscribe(data => {
      
       console.log(data);
      //Retrieve data from flask.
      const changedData$: Observable<CloudData[]> = of([]);
      changedData$.subscribe(res => this.cData = res);

      //Convert data as JSON format.
      this.serverData = data as JSON;


      //Push data for WordCloud.
      for(let i in data){
        this.cData.push({text:data[i]["label"], weight:data[i]["y"]})
      }
      console.log(this.cData);
    })
  }
  getResult(){
    this.searchKeyword = "flask test"
    let body= 
      {"keyword":this.searchKeyword}
    
    this.http.post(this.TEST_URL, 
      body)
      .subscribe(
        (data) => {
          console.log(data);
        }
      )
  }
  

  
}
