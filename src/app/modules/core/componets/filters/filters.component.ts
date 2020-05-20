import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient} from '@angular/common/http';
import { SourceMapGenerator } from '@angular/compiler/src/output/source_map';
import { Observable} from 'rxjs'
import {map, filter, switchMap} from 'rxjs/operators';
import { IpService } from 'src/app/ip.service'

interface Post{
  "postName" : string;
  "category" : string;
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.less']
})
/*export*/ class FiltersComponent implements OnInit {

  public post;
  private URL = this.ipService.getUserServerIp() + ":9200/victolee/blog/1/_source"

  constructor(public http:HttpClient,private ipService : IpService
    ) { }

  ngOnInit() {
    this.fetchPosts();
  }

  public fetchPosts() {
    return this.http.get(this.URL)
        .subscribe((data) => {
          this.post = data;
          console.log(this.post);
        })
  }

 


}
