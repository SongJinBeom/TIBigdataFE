import { ArticleSource } from '../../article/article.interface';
import { Injectable } from '@angular/core';
// import { HomesModule } from '../../../homes.module'

@Injectable()
export class IdControlService {
  private idChosen : string = "";
  private idList : string[] = new Array<string>();
  private article : ArticleSource;
  constructor() { }

  clearAll(){
    this.idChosen = "";
    this.idList = [];
    this.idChosen = "";
  }

  setIdList(id:string){
    this.idList.push(id);
  }

  popIdList(){
    this.idList.pop();
  }

  clearIdList(){
    this.idList = [];
  }

  getIdList(){
    return this.idList;
  }

  clearIds(){
    this.idList = [];
  }

  setIdChosen(id : string){
    this.idChosen = id;
    // console.log(this.idChosen);
  }

  getIdChosen(){
    return this.idChosen;
  }

  clearIdChosen(){
    this.idChosen = "";
  }

  getArticle(){
    return this.article;
  }

  setArticle(art:ArticleSource){
    this.article = art;
  }

  

}
