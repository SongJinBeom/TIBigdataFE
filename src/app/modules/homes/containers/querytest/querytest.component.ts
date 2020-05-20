import { Component, OnInit, ChangeDetectorRef, Input} from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { ElasticsearchService } from '../../body/search/service/elasticsearch-service/elasticsearch.service';
import { ArticleSource } from '../../body/search/article/article.interface';
import { Subscription } from 'rxjs';
import { Observable, of} from 'rxjs';
import { Client } from 'elasticsearch';
import { IpService } from 'src/app/ip.service'

@Component({
  selector: 'app-querytest',
  templateUrl: './querytest.component.html',
  styleUrls: ['./querytest.component.less']
})
export class QuerytestComponent implements OnInit {

  private URL = this.ipService.getUserServerIp()
  //Flask data
  private BASE_URL: string = URL+':5000/queryTest';
  // private headers: Headers = new Headers({'Content-Type': 'application/json'});
  // serverData: JSON;


  // isConnected = false;
  // status: string;

  // subscription: Subscription

  searchKeyword: string;


  // articleSources: ArticleSource[];

  // queryResults: ArticleSource[];

  constructor(
    private http:HttpClient,
    private ipService : IpService
    // private es: ElasticsearchService
    )// , 
    // private cd: ChangeDetectorRef) 
    { 
    // this.isConnected = false;
    // this.subscription = this.es.articleInfo$.subscribe( info => {
    //   this.articleSources=info;
    //   console.log(this.articleSources);
    // });
 
  }


  ngOnInit() {

  }

  //Get result from flask
  getResult(){
    this.searchKeyword = "flask test"
    let body= 
      {"keyword":this.searchKeyword}
    
    this.http.post(this.BASE_URL, 
      body)
      .subscribe(
        (data) => {
          console.log(data);
        }
      )
  }

}
