import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibraryRoutingModule } from './library-routing.module';
import { LibraryRootComponent } from './library-root/library-root.component';
import { CategoryComponent } from './category/category.component';
import { GraphComponent } from './graph/graph.component';
import { CatGraphComponent } from './category-graph/category-graph.component';

@NgModule({
  declarations: [
    LibraryRootComponent, 
    CategoryComponent, 
    GraphComponent,
    CatGraphComponent
  ],
  imports: [
    CommonModule,
    LibraryRoutingModule
  ],
  exports:[
    LibraryRootComponent,
  ]
})
export class LibraryModule { }
